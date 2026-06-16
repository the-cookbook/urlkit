import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export type DateFormatStringMode = 'date' | 'date-time';

export interface DateFormatStringOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

type DateFormatToken = 'yyyy' | 'MM' | 'dd' | 'HH' | 'mm' | 'ss' | 'SSS';

interface TokenPart {
  readonly type: 'token';
  readonly value: DateFormatToken;
}

interface LiteralPart {
  readonly type: 'literal';
  readonly value: string;
}

type DateFormatPart = TokenPart | LiteralPart;

interface CompiledDateFormatString {
  readonly format: string;
  readonly mode: DateFormatStringMode;
  readonly parts: readonly DateFormatPart[];
  readonly pattern: RegExp;
  readonly hasMilliseconds: boolean;
}

interface DateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

const supportedTokens: readonly DateFormatToken[] = ['yyyy', 'SSS', 'MM', 'dd', 'HH', 'mm', 'ss'];
const dateTokens = new Set<DateFormatToken>(['yyyy', 'MM', 'dd']);
const dateTimeTokens = new Set<DateFormatToken>(['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'SSS']);

export function parseDateFormatString(
  input: string,
  format: string,
  mode: DateFormatStringMode,
  options: DateFormatStringOptions = {},
): Date {
  const compiled = compileDateFormatString(format, mode);
  const match = compiled.pattern.exec(input);

  if (!match?.groups) {
    throw createDateFormatStringError(
      `${getFormatLabel(mode)} value must match format "${format}".`,
      options,
    );
  }

  const parts = readDateParts(match.groups, compiled);
  assertValidDateParts(parts, mode, options);

  const value = new Date(
    Date.UTC(
      0,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      parts.millisecond,
    ),
  );
  value.setUTCFullYear(parts.year);

  if (!matchesDateParts(value, parts)) {
    throw createDateFormatStringError(
      `${getFormatLabel(mode)} value must be a valid UTC calendar ${
        mode === 'date' ? 'date' : 'instant'
      }.`,
      options,
    );
  }

  return value;
}

export function serializeDateFormatString(
  input: Date,
  format: string,
  mode: DateFormatStringMode,
  options: DateFormatStringOptions = {},
): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw createDateFormatStringError(
      `${getFormatLabel(mode)} value must be a valid Date.`,
      options,
    );
  }

  const compiled = compileDateFormatString(format, mode);
  const year = input.getUTCFullYear();

  if (year < 0 || year > 9999) {
    throw createDateFormatStringError(
      `${getFormatLabel(mode)} value year must be between 0000 and 9999 for yyyy format strings.`,
      options,
    );
  }

  if (mode === 'date-time' && !compiled.hasMilliseconds && input.getUTCMilliseconds() !== 0) {
    throw createDateFormatStringError(
      'Date-time value cannot be serialized without losing milliseconds. Include SSS in the format or use a Date with zero milliseconds.',
      options,
    );
  }

  return compiled.parts
    .map((part) => {
      if (part.type === 'literal') {
        return part.value;
      }

      return serializeToken(input, part.value);
    })
    .join('');
}

export function validateDateFormatString(format: string, mode: DateFormatStringMode): void {
  compileDateFormatString(format, mode);
}

function compileDateFormatString(
  format: string,
  mode: DateFormatStringMode,
): CompiledDateFormatString {
  const parts = tokenizeDateFormatString(format, mode);
  validateDateFormatParts(format, parts, mode);

  const pattern = new RegExp(
    `^${parts
      .map((part) =>
        part.type === 'literal' ? escapeRegExp(part.value) : getTokenPattern(part.value),
      )
      .join('')}$`,
  );

  return {
    format,
    mode,
    parts,
    pattern,
    hasMilliseconds: parts.some((part) => part.type === 'token' && part.value === 'SSS'),
  };
}

function tokenizeDateFormatString(format: string, mode: DateFormatStringMode): DateFormatPart[] {
  if (typeof format !== 'string' || format.length === 0) {
    throw createInvalidDateFormatDescriptorError(
      `${getFormatLabel(mode)} format must be a non-empty string.`,
    );
  }

  const parts: DateFormatPart[] = [];
  let index = 0;

  while (index < format.length) {
    if (format[index] === "'") {
      const literalEnd = format.indexOf("'", index + 1);

      if (literalEnd === -1) {
        throw createInvalidDateFormatDescriptorError(
          `${getFormatLabel(mode)} format contains an unterminated quoted literal.`,
        );
      }

      const literal = format.slice(index + 1, literalEnd);

      if (literal.length === 0) {
        throw createInvalidDateFormatDescriptorError(
          `${getFormatLabel(mode)} format contains an empty quoted literal.`,
        );
      }

      parts.push({ type: 'literal', value: literal });
      index = literalEnd + 1;
      continue;
    }

    const token = findTokenAt(format, index);

    if (token) {
      parts.push({ type: 'token', value: token });
      index += token.length;
      continue;
    }

    const character = format[index] ?? '';

    if (isAsciiLetter(character)) {
      throw createInvalidDateFormatDescriptorError(
        `${getFormatLabel(mode)} format contains unsupported token near "${format.slice(index)}".`,
      );
    }

    parts.push({ type: 'literal', value: character });
    index += 1;
  }

  return mergeAdjacentLiterals(parts);
}

function findTokenAt(format: string, index: number): DateFormatToken | undefined {
  return supportedTokens.find((token) => format.startsWith(token, index));
}

function mergeAdjacentLiterals(parts: readonly DateFormatPart[]): DateFormatPart[] {
  const merged: DateFormatPart[] = [];

  for (const part of parts) {
    const previous = merged[merged.length - 1];

    if (part.type === 'literal' && previous?.type === 'literal') {
      merged[merged.length - 1] = { type: 'literal', value: `${previous.value}${part.value}` };
      continue;
    }

    merged.push(part);
  }

  return merged;
}

function validateDateFormatParts(
  format: string,
  parts: readonly DateFormatPart[],
  mode: DateFormatStringMode,
): void {
  const allowedTokens = mode === 'date' ? dateTokens : dateTimeTokens;
  const requiredTokens: readonly DateFormatToken[] =
    mode === 'date' ? ['yyyy', 'MM', 'dd'] : ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss'];
  const seenTokens = new Set<DateFormatToken>();

  for (const part of parts) {
    if (part.type === 'literal') {
      continue;
    }

    if (!allowedTokens.has(part.value)) {
      throw createInvalidDateFormatDescriptorError(
        `${getFormatLabel(mode)} format "${format}" contains unsupported token "${part.value}".`,
      );
    }

    if (seenTokens.has(part.value)) {
      throw createInvalidDateFormatDescriptorError(
        `${getFormatLabel(mode)} format "${format}" contains duplicate token "${part.value}".`,
      );
    }

    seenTokens.add(part.value);
  }

  for (const token of requiredTokens) {
    if (!seenTokens.has(token)) {
      throw createInvalidDateFormatDescriptorError(
        `${getFormatLabel(mode)} format "${format}" is missing required token "${token}".`,
      );
    }
  }
}

function readDateParts(
  groups: Record<string, string | undefined>,
  compiled: CompiledDateFormatString,
): DateParts {
  return {
    year: Number(groups.yyyy),
    month: Number(groups.MM),
    day: Number(groups.dd),
    hour: compiled.mode === 'date-time' ? Number(groups.HH) : 0,
    minute: compiled.mode === 'date-time' ? Number(groups.mm) : 0,
    second: compiled.mode === 'date-time' ? Number(groups.ss) : 0,
    millisecond: compiled.hasMilliseconds ? Number(groups.SSS) : 0,
  };
}

function assertValidDateParts(
  parts: DateParts,
  mode: DateFormatStringMode,
  options: DateFormatStringOptions,
): void {
  if (
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59 ||
    parts.second < 0 ||
    parts.second > 59 ||
    parts.millisecond < 0 ||
    parts.millisecond > 999
  ) {
    throw createDateFormatStringError(
      `${getFormatLabel(mode)} value must be a valid UTC calendar ${
        mode === 'date' ? 'date' : 'instant'
      }.`,
      options,
    );
  }
}

function matchesDateParts(value: Date, parts: DateParts): boolean {
  return (
    value.getUTCFullYear() === parts.year &&
    value.getUTCMonth() === parts.month - 1 &&
    value.getUTCDate() === parts.day &&
    value.getUTCHours() === parts.hour &&
    value.getUTCMinutes() === parts.minute &&
    value.getUTCSeconds() === parts.second &&
    value.getUTCMilliseconds() === parts.millisecond
  );
}

function serializeToken(input: Date, token: DateFormatToken): string {
  switch (token) {
    case 'yyyy':
      return String(input.getUTCFullYear()).padStart(4, '0');
    case 'MM':
      return String(input.getUTCMonth() + 1).padStart(2, '0');
    case 'dd':
      return String(input.getUTCDate()).padStart(2, '0');
    case 'HH':
      return String(input.getUTCHours()).padStart(2, '0');
    case 'mm':
      return String(input.getUTCMinutes()).padStart(2, '0');
    case 'ss':
      return String(input.getUTCSeconds()).padStart(2, '0');
    case 'SSS':
      return String(input.getUTCMilliseconds()).padStart(3, '0');
  }
}

function getTokenPattern(token: DateFormatToken): string {
  return `(?<${token}>\\d{${token === 'yyyy' || token === 'SSS' ? token.length.toString() : '2'}})`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isAsciiLetter(value: string): boolean {
  return /^[A-Za-z]$/.test(value);
}

function getFormatLabel(mode: DateFormatStringMode): string {
  return mode === 'date' ? 'Date' : 'Date-time';
}

function createDateFormatStringError(
  message: string,
  options: DateFormatStringOptions,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}

function createInvalidDateFormatDescriptorError(message: string): UrlKitError {
  return new UrlKitError('invalid-descriptor', message);
}
