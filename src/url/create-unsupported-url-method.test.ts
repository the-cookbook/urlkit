import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createUnsupportedUrlMethod } from './create-unsupported-url-method.js';

describe('createUnsupportedUrlMethod', () => {
  it('throws a deterministic UrlKitError for scaffolded methods', () => {
    const method = createUnsupportedUrlMethod('parse');

    expect(() => method('/users')).toThrow(UrlKitError);

    try {
      method('/users');
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-url');
      expect((error as UrlKitError).message).toBe('UrlContract.parse is not implemented yet.');
    }
  });
});
