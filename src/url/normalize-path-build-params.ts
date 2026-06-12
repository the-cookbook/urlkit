import { UrlKitError } from '../errors/url-kit-error.js';

type PathBuildParamValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[]
  | null
  | undefined;

export function normalizePathBuildParams(params: unknown): Record<string, PathBuildParamValue> {
  if (params === undefined) {
    return {};
  }

  if (!isRecord(params)) {
    throw new UrlKitError('invalid-param', 'Path params must be an object.', { path: ['params'] });
  }

  const normalized: Record<string, PathBuildParamValue> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      throw new UrlKitError('missing-param', `Path parameter "${key}" is required.`, {
        path: ['params', key],
      });
    }

    if (Array.isArray(value)) {
      if (isPathBuildParamValue(value)) {
        normalized[key] = [...value];
        continue;
      }
    } else if (isPathBuildParamValue(value)) {
      normalized[key] = value;
      continue;
    }

    throw new UrlKitError(
      'invalid-param',
      `Path parameter "${key}" must be a string, number, boolean, or array of those values.`,
      {
        path: ['params', key],
      },
    );
  }

  return normalized;
}

function isPathBuildParamValue(input: unknown): input is PathBuildParamValue {
  if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return true;
  }

  if (!Array.isArray(input)) {
    return false;
  }

  return input.every(
    (value) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean',
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
