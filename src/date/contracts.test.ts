import { describe, expect, it, expectTypeOf } from 'vitest';
import type { BuiltInDateFormat, DateFormatCodec, DateFormatString } from './contracts.js';

describe('date contracts', () => {
  it('keeps built-in date formats narrow and supports custom format strings and codecs', () => {
    const format: BuiltInDateFormat = 'unix-ms';
    const formatString: DateFormatString = 'dd-MM-yyyy';
    const codec: DateFormatCodec = {
      parse(value) {
        return new Date(value);
      },
      serialize(value) {
        return value.toISOString();
      },
    };

    expect(format).toBe('unix-ms');
    expect(formatString).toBe('dd-MM-yyyy');
    expect(codec.serialize(codec.parse('2026-01-01T00:00:00.000Z'))).toBe(
      '2026-01-01T00:00:00.000Z',
    );
    expectTypeOf<'date' | 'date-time' | 'unix-seconds' | 'unix-ms'>(format);
    expectTypeOf<string>(formatString);
  });
});
