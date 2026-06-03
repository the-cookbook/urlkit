import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const unixIntegerPattern = /^-?\d+$/;

export interface ParseUnixMsOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function parseUnixMs(input: string, options: ParseUnixMsOptions = {}): Date {
  const milliseconds = parseUnixInteger(
    input,
    'Unix milliseconds value must be a finite integer.',
    options,
  );
  const value = new Date(milliseconds);

  if (!Number.isFinite(value.getTime())) {
    throw createInvalidUnixMsError(
      'Unix milliseconds value must be a valid Date instant.',
      options,
    );
  }

  return value;
}

function parseUnixInteger(input: string, message: string, options: ParseUnixMsOptions): number {
  if (!unixIntegerPattern.test(input)) {
    throw createInvalidUnixMsError(message, options);
  }

  const value = Number(input);

  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw createInvalidUnixMsError(message, options);
  }

  return value;
}

function createInvalidUnixMsError(message: string, options: ParseUnixMsOptions): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
