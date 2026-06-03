import { describe, expect, it } from 'vitest';
import type { UrlKitErrorCode } from './contracts.js';
import { UrlKitError } from './url-kit-error.js';

const requiredCodes = [
  'invalid-url',
  'path-mismatch',
  'missing-param',
  'invalid-param',
  'missing-search',
  'invalid-search',
  'invalid-hash',
  'invalid-descriptor',
] as const satisfies readonly UrlKitErrorCode[];

describe('UrlKitError', () => {
  it('is the public runtime error class', () => {
    const error = new UrlKitError('invalid-url');

    expect(error).toBeInstanceOf(UrlKitError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UrlKitError');
  });

  it('supports every required error code with deterministic default messages', () => {
    const messages = requiredCodes.map((code) => new UrlKitError(code).message);

    expect(messages).toEqual([
      'Invalid URL.',
      'Pathname does not match the URL pattern.',
      'Required path parameter is missing.',
      'Path parameter is invalid.',
      'Required search parameter is missing.',
      'Search parameter is invalid.',
      'Hash fragment is invalid.',
      'URL descriptor is invalid.',
    ]);
  });

  it('stores the readonly code', () => {
    const error = new UrlKitError('invalid-search');

    expect(error.code).toBe('invalid-search');
  });

  it('supports a custom deterministic message', () => {
    const error = new UrlKitError('invalid-search', 'Expected integer search parameter.');

    expect(error.message).toBe('Expected integer search parameter.');
  });

  it('stores a copied readonly path when provided through options', () => {
    const path = ['search', 'page'];
    const error = new UrlKitError('invalid-search', { path });

    path.push('ignored');

    expect(error.path).toEqual(['search', 'page']);
  });

  it('stores a copied readonly path when provided with a custom message', () => {
    const error = new UrlKitError('missing-param', 'Missing id.', {
      path: ['params', 'id'],
    });

    expect(error.path).toEqual(['params', 'id']);
  });

  it('stores the optional cause', () => {
    const cause = new Error('inner');
    const error = new UrlKitError('invalid-url', { cause });

    expect(error.cause).toBe(cause);
  });

  it('stores path and cause together', () => {
    const cause = new Error('inner');
    const error = new UrlKitError('invalid-descriptor', 'Bad descriptor.', {
      path: ['search', 'page'],
      cause,
    });

    expect(error.path).toEqual(['search', 'page']);
    expect(error.cause).toBe(cause);
  });
});
