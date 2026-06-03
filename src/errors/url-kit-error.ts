import type { UrlKitErrorCode, UrlKitErrorOptions } from './contracts.js';

const defaultMessages = {
  'invalid-url': 'Invalid URL.',
  'path-mismatch': 'Pathname does not match the URL pattern.',
  'missing-param': 'Required path parameter is missing.',
  'invalid-param': 'Path parameter is invalid.',
  'missing-search': 'Required search parameter is missing.',
  'invalid-search': 'Search parameter is invalid.',
  'invalid-hash': 'Hash fragment is invalid.',
  'invalid-descriptor': 'URL descriptor is invalid.',
} satisfies Record<UrlKitErrorCode, string>;

function resolveMessage(
  code: UrlKitErrorCode,
  messageOrOptions?: string | UrlKitErrorOptions,
): string {
  if (typeof messageOrOptions === 'string') {
    return messageOrOptions;
  }

  return defaultMessages[code];
}

function resolveOptions(
  messageOrOptions?: string | UrlKitErrorOptions,
  options?: UrlKitErrorOptions,
): UrlKitErrorOptions | undefined {
  if (typeof messageOrOptions === 'string') {
    return options;
  }

  return messageOrOptions;
}

function hasCause(
  options: UrlKitErrorOptions | undefined,
): options is UrlKitErrorOptions & { readonly cause: unknown } {
  return Boolean(options && 'cause' in options);
}

export class UrlKitError extends Error {
  readonly code: UrlKitErrorCode;
  readonly path?: readonly string[];
  override readonly cause?: unknown;

  constructor(code: UrlKitErrorCode, options?: UrlKitErrorOptions);
  constructor(code: UrlKitErrorCode, message?: string, options?: UrlKitErrorOptions);
  constructor(
    code: UrlKitErrorCode,
    messageOrOptions?: string | UrlKitErrorOptions,
    options?: UrlKitErrorOptions,
  ) {
    const resolvedOptions = resolveOptions(messageOrOptions, options);

    super(
      resolveMessage(code, messageOrOptions),
      hasCause(resolvedOptions) ? { cause: resolvedOptions.cause } : undefined,
    );

    this.name = 'UrlKitError';
    this.code = code;

    if (resolvedOptions?.path) {
      this.path = [...resolvedOptions.path];
    }

    if (hasCause(resolvedOptions)) {
      this.cause = resolvedOptions.cause;
    }
  }
}
