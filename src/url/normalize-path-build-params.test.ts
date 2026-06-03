import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizePathBuildParams } from './normalize-path-build-params.js';

describe('normalizePathBuildParams', () => {
  it('normalizes undefined params to an empty object', () => {
    expect(normalizePathBuildParams(undefined)).toEqual({});
  });

  it('rejects missing parameter values', () => {
    expect(() => normalizePathBuildParams({ id: undefined })).toThrow(UrlKitError);
    expect(() => normalizePathBuildParams({ id: null })).toThrow(UrlKitError);
  });

  it('rejects invalid parameter value types', () => {
    expect(() => normalizePathBuildParams({ id: {} })).toThrow(UrlKitError);
    expect(() => normalizePathBuildParams([])).toThrow(UrlKitError);
  });
});
