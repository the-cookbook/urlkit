import { UrlKitError } from '../errors/url-kit-error.js';

export function mapPathKitMatchError(
  error: unknown,
  paramNames: readonly string[] = [],
): UrlKitError {
  if (error instanceof UrlKitError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Path parameter is invalid.';
  const paramName = readPathParamName(message, paramNames);

  return new UrlKitError('invalid-param', message, {
    path: paramName ? ['params', paramName] : ['params'],
    cause: error,
  });
}

function readPathParamName(message: string, paramNames: readonly string[]): string | undefined {
  const quotedParamName = /Parameter ["']([^"']+)["']/.exec(message)?.[1];

  if (quotedParamName && isKnownParamName(quotedParamName, paramNames)) {
    return quotedParamName;
  }

  for (const paramName of paramNames) {
    if (mentionsPathParam(message, paramName)) {
      return paramName;
    }
  }

  return undefined;
}

function isKnownParamName(paramName: string, paramNames: readonly string[]): boolean {
  return paramNames.includes(paramName);
}

function mentionsPathParam(message: string, paramName: string): boolean {
  const escapedParamName = escapeRegExp(paramName);

  return new RegExp(
    `\\bParameter\\b[^\\n]*(["']${escapedParamName}["']|\\b${escapedParamName}\\b)`,
  ).test(message);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
