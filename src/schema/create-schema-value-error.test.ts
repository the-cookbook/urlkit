import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createSchemaValueError } from './create-schema-value-error.js';

describe('createSchemaValueError', () => {
  it('creates path-aware UrlKitError instances', () => {
    const cause = new Error('inner');
    const error = createSchemaValueError(
      'invalid-search',
      'Invalid value.',
      ['search', 'page'],
      cause,
    );

    expect(error).toBeInstanceOf(UrlKitError);
    expect(error.code).toBe('invalid-search');
    expect(error.message).toBe('Invalid value.');
    expect(error.path).toEqual(['search', 'page']);
    expect(error.cause).toBe(cause);
  });
});
