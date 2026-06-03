import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const unixIntegerPattern = /^-?\d+$/;

export interface ParseUnixSecondsOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function parseUnixSeconds(input: string, options: ParseUnixSecondsOptions = {}): Date {
  const seconds = parseUnixInteger(input, 'Unix seconds value must be a finite integer.', options);
  const milliseconds = seconds * 1000;
  const value = new Date(milliseconds);

  if (!Number.isFinite(milliseconds) || !Number.isFinite(value.getTime())) {
    throw createInvalidUnixSecondsError(
      'Unix seconds value must be a valid Date instant.',
      options,
    );
  }

  return value;
}

function parseUnixInteger(
  input: string,
  message: string,
  options: ParseUnixSecondsOptions,
): number {
  if (!unixIntegerPattern.test(input)) {
    throw createInvalidUnixSecondsError(message, options);
  }

  const value = Number(input);

  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw createInvalidUnixSecondsError(message, options);
  }

  return value;
}

function createInvalidUnixSecondsError(
  message: string,
  options: ParseUnixSecondsOptions,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
