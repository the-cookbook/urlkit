import { UrlKitError } from '../errors/url-kit-error.js';

export function normalizePathBuildParams(
  params: unknown,
): Record<string, string | number | boolean> {
  if (params === undefined) {
    return {};
  }

  if (!isRecord(params)) {
    throw new UrlKitError('invalid-param', 'Path params must be an object.', { path: ['params'] });
  }

  const normalized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      throw new UrlKitError('missing-param', `Path parameter "${key}" is required.`, {
        path: ['params', key],
      });
    }

    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new UrlKitError(
        'invalid-param',
        `Path parameter "${key}" must be a string, number, or boolean.`,
        {
          path: ['params', key],
        },
      );
    }

    normalized[key] = value;
  }

  return normalized;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
