import { describe, expect, it } from 'vitest';
import type { BuiltInDateFormat, DateFormatCodec } from './contracts.js';

function expectType<Value>(_value: Value): void {}

describe('date contracts', () => {
  it('keeps built-in date formats narrow and custom codecs explicit', () => {
    const format: BuiltInDateFormat = 'unix-ms';
    const codec: DateFormatCodec = {
      parse(value) {
        return new Date(value);
      },
      serialize(value) {
        return value.toISOString();
      },
    };

    expect(format).toBe('unix-ms');
    expect(codec.serialize(codec.parse('2026-01-01T00:00:00.000Z'))).toBe(
      '2026-01-01T00:00:00.000Z',
    );
    expectType<'date' | 'date-time' | 'unix-seconds' | 'unix-ms'>(format);
  });
});
