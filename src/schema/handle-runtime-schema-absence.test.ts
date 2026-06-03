import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { NormalizedRuntimeSchemaDescriptor } from './contracts.js';
import { handleRuntimeSchemaAbsence } from './handle-runtime-schema-absence.js';

const optionalDescriptor = {
  kind: 'test',
  presence: 'optional',
  options: {},
} satisfies NormalizedRuntimeSchemaDescriptor<'test', Record<never, never>>;

const requiredDescriptor = {
  kind: 'test',
  presence: 'required',
  options: {},
} satisfies NormalizedRuntimeSchemaDescriptor<'test', Record<never, never>>;

const defaultedDescriptor = {
  kind: 'test',
  presence: 'defaulted',
  options: {},
  defaultValue: 'fallback',
} satisfies NormalizedRuntimeSchemaDescriptor<'test', Record<never, never>, string>;

describe('handleRuntimeSchemaAbsence', () => {
  it('does not handle present values', () => {
    expect(handleRuntimeSchemaAbsence(optionalDescriptor, 'value')).toEqual({ handled: false });
  });

  it('treats optional undefined and null as absent', () => {
    expect(handleRuntimeSchemaAbsence(optionalDescriptor, undefined)).toEqual({
      handled: true,
      value: undefined,
    });
    expect(handleRuntimeSchemaAbsence(optionalDescriptor, null)).toEqual({
      handled: true,
      value: undefined,
    });
  });

  it('applies defaults for undefined and null', () => {
    expect(handleRuntimeSchemaAbsence(defaultedDescriptor, undefined)).toEqual({
      handled: true,
      value: 'fallback',
    });
    expect(handleRuntimeSchemaAbsence(defaultedDescriptor, null)).toEqual({
      handled: true,
      value: 'fallback',
    });
  });

  it('rejects missing required undefined values', () => {
    expect(() =>
      handleRuntimeSchemaAbsence(requiredDescriptor, undefined, { path: ['search', 'q'] }),
    ).toThrow(UrlKitError);

    try {
      handleRuntimeSchemaAbsence(requiredDescriptor, undefined, { path: ['search', 'q'] });
    } catch (error) {
      expect((error as UrlKitError).code).toBe('missing-search');
      expect((error as UrlKitError).path).toEqual(['search', 'q']);
    }
  });

  it('rejects required null values with the validation error code', () => {
    try {
      handleRuntimeSchemaAbsence(requiredDescriptor, null, { path: ['search', 'q'] });
    } catch (error) {
      expect((error as UrlKitError).code).toBe('invalid-search');
      expect((error as UrlKitError).message).toBe('Required value cannot be null.');
    }
  });
});
