import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { boolean } from './boolean.js';
import {
  safeNormalizeRuntimeSchemaValue,
  safeParseRuntimeSchemaValue,
  safeSerializeRuntimeSchemaValue,
} from './safe-runtime-schema-value.js';

describe('safe runtime schema value helpers', () => {
  it('returns parse successes and failures', () => {
    expect(safeParseRuntimeSchemaValue(boolean(), 'true')).toEqual({ success: true, data: true });

    const result = safeParseRuntimeSchemaValue(boolean(), '1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UrlKitError);
      expect(result.error.code).toBe('invalid-search');
    }
  });

  it('returns normalize successes and failures', () => {
    expect(safeNormalizeRuntimeSchemaValue(boolean(), false)).toEqual({
      success: true,
      data: false,
    });

    const result = safeNormalizeRuntimeSchemaValue(boolean(), 'false');

    expect(result.success).toBe(false);
  });

  it('returns serialize successes and failures', () => {
    expect(safeSerializeRuntimeSchemaValue(boolean(), true)).toEqual({
      success: true,
      data: 'true',
    });

    const result = safeSerializeRuntimeSchemaValue(boolean(), 'true');

    expect(result.success).toBe(false);
  });
});
