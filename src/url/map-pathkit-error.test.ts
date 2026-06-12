import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { mapPathKitMatchError } from './map-pathkit-error.js';

describe('mapPathKitMatchError', () => {
  it('maps PathKit parameter errors to the specific path param when possible', () => {
    const error = mapPathKitMatchError(new Error('[Constraint] Parameter "id" must be a number.'), [
      'id',
    ]);

    expect(error).toBeInstanceOf(UrlKitError);
    expect(error.code).toBe('invalid-param');
    expect(error.path).toEqual(['params', 'id']);
  });

  it('does not trust unknown param names from PathKit error messages', () => {
    const error = mapPathKitMatchError(new Error('[Constraint] Parameter "unknown" is invalid.'), [
      'id',
    ]);

    expect(error.code).toBe('invalid-param');
    expect(error.path).toEqual(['params']);
  });

  it('falls back to params when no path param can be inferred', () => {
    const error = mapPathKitMatchError(new Error('Path parameter is invalid.'), ['id']);

    expect(error.code).toBe('invalid-param');
    expect(error.path).toEqual(['params']);
  });
});
