import { UrlKitError } from '../errors/url-kit-error.js';

export function mapPathKitMatchError(error: unknown): UrlKitError {
  if (error instanceof UrlKitError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Path parameter is invalid.';
  const paramName = readPathParamName(message);

  return new UrlKitError('invalid-param', message, {
    path: paramName ? ['params', paramName] : ['params'],
    cause: error,
  });
}

function readPathParamName(message: string): string | undefined {
  return /Parameter "([^"]+)"/.exec(message)?.[1];
}
