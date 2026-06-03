import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  StaticEnumHashDescriptor,
  StaticHashDescriptor,
  StaticStringHashDescriptor,
} from '../static/contracts.js';
import type { NormalizedHashDescriptor } from './contracts.js';

export function compileStaticHashDescriptor(
  descriptor: StaticHashDescriptor,
): NormalizedHashDescriptor<string | undefined> {
  if (Array.isArray(descriptor)) {
    return Object.freeze({
      kind: 'enum',
      presence: 'optional',
      values: normalizeEnumValues(descriptor),
    });
  }

  if (isStaticStringHashDescriptor(descriptor)) {
    return compileStaticStringHashDescriptor(descriptor);
  }

  if (isStaticEnumHashDescriptor(descriptor)) {
    return compileStaticEnumHashDescriptor(descriptor);
  }

  throw new UrlKitError(
    'invalid-descriptor',
    'Hash descriptor must be a string, enum, or enum shorthand descriptor.',
    {
      path: ['hash'],
    },
  );
}

function compileStaticStringHashDescriptor(
  descriptor: StaticStringHashDescriptor,
): NormalizedHashDescriptor<string | undefined> {
  assertOptionalFlag(descriptor.optional);

  if (
    'default' in descriptor &&
    descriptor.default !== undefined &&
    typeof descriptor.default !== 'string'
  ) {
    throw new UrlKitError('invalid-descriptor', 'String hash default must be a string.', {
      path: ['hash'],
    });
  }

  if (descriptor.default !== undefined) {
    return Object.freeze({
      kind: 'string',
      presence: 'defaulted',
      defaultValue: descriptor.default,
    });
  }

  return Object.freeze({ kind: 'string', presence: descriptor.optional ? 'optional' : 'required' });
}

function compileStaticEnumHashDescriptor(
  descriptor: StaticEnumHashDescriptor,
): NormalizedHashDescriptor<string | undefined> {
  assertOptionalFlag(descriptor.optional);

  const values = normalizeEnumValues(descriptor.values);

  if (descriptor.default !== undefined && !values.includes(descriptor.default)) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Enum hash default must be one of the declared values.',
      { path: ['hash'] },
    );
  }

  if (descriptor.default !== undefined) {
    return Object.freeze({
      kind: 'enum',
      presence: 'defaulted',
      values,
      defaultValue: descriptor.default,
    });
  }

  return Object.freeze({
    kind: 'enum',
    presence: descriptor.optional ? 'optional' : 'required',
    values,
  });
}

function normalizeEnumValues(values: readonly string[]): readonly string[] {
  if (!Array.isArray(values) || !values.length) {
    throw new UrlKitError('invalid-descriptor', 'Enum hash values must be a non-empty array.', {
      path: ['hash'],
    });
  }

  for (const value of values) {
    if (typeof value !== 'string') {
      throw new UrlKitError('invalid-descriptor', 'Enum hash values must be strings.', {
        path: ['hash'],
      });
    }
  }

  return Object.freeze(values.map((value) => value));
}

function assertOptionalFlag(optional: unknown): void {
  if (optional !== undefined && typeof optional !== 'boolean') {
    throw new UrlKitError('invalid-descriptor', 'Hash optional flag must be a boolean.', {
      path: ['hash'],
    });
  }
}

function isStaticStringHashDescriptor(input: unknown): input is StaticStringHashDescriptor {
  return isRecord(input) && input.type === 'string';
}

function isStaticEnumHashDescriptor(input: unknown): input is StaticEnumHashDescriptor {
  return isRecord(input) && input.type === 'enum';
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
