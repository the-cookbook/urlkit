import { parseDate } from '../date/parse-date.js';
import { parseCustomDate } from '../date/parse-custom-date.js';
import {
  parseDateFormatString,
  serializeDateFormatString,
  type DateFormatStringMode,
  validateDateFormatString,
} from '../date/date-format-string.js';
import { parseDateTime } from '../date/parse-date-time.js';
import { parseUnixMs } from '../date/parse-unix-ms.js';
import { parseUnixSeconds } from '../date/parse-unix-seconds.js';
import { serializeDate } from '../date/serialize-date.js';
import { serializeCustomDate } from '../date/serialize-custom-date.js';
import { serializeDateTime } from '../date/serialize-date-time.js';
import { serializeUnixMs } from '../date/serialize-unix-ms.js';
import { serializeUnixSeconds } from '../date/serialize-unix-seconds.js';
import type { DateFormatCodec, DateFormatString } from '../date/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  RequiredRuntimeSchemaDescriptor,
  RuntimeDefaultValidationContext,
  RuntimeSchemaBuilder,
  RuntimeSchemaCodec,
  RuntimeSchemaOptions,
  RuntimeSchemaValueContext,
} from './contracts.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { createSchemaValueError } from './create-schema-value-error.js';

export type BuiltInRuntimeDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';
export type RuntimeDateFormat = BuiltInRuntimeDateFormat | DateFormatString | DateFormatCodec;

export interface DateSchemaOptions<
  Format extends RuntimeDateFormat = RuntimeDateFormat,
> extends RuntimeSchemaOptions {
  readonly format: Format;
}

export interface DateSchema<Format extends RuntimeDateFormat = 'date'> extends RuntimeSchemaBuilder<
  Date,
  'date',
  DateSchemaOptions<Format>,
  RequiredRuntimeSchemaDescriptor<'date', DateSchemaOptions<Format>>
> {}

export interface DateOptions<Format extends RuntimeDateFormat = 'date'> {
  readonly format?: Format;
}

const dateOnlyCodec: RuntimeSchemaCodec<Date> = {
  parse(input, context) {
    return parseDate(input, { code: context.errorCode, path: context.path });
  },

  normalize(input, context) {
    return validateDate(input, context);
  },

  serialize(input, context) {
    return serializeDate(input, { code: context.errorCode, path: context.path });
  },
};

const dateTimeCodec: RuntimeSchemaCodec<Date> = {
  parse(input, context) {
    return parseDateTime(input, { code: context.errorCode, path: context.path });
  },

  normalize(input, context) {
    return validateDate(input, context);
  },

  serialize(input, context) {
    return serializeDateTime(input, { code: context.errorCode, path: context.path });
  },
};

const unixSecondsCodec: RuntimeSchemaCodec<Date> = {
  parse(input, context) {
    return parseUnixSeconds(input, { code: context.errorCode, path: context.path });
  },

  normalize(input, context) {
    return validateDate(input, context);
  },

  serialize(input, context) {
    return serializeUnixSeconds(input, { code: context.errorCode, path: context.path });
  },
};

const unixMsCodec: RuntimeSchemaCodec<Date> = {
  parse(input, context) {
    return parseUnixMs(input, { code: context.errorCode, path: context.path });
  },

  normalize(input, context) {
    return validateDate(input, context);
  },

  serialize(input, context) {
    return serializeUnixMs(input, { code: context.errorCode, path: context.path });
  },
};

export function date(): DateSchema;
export function date<const Format extends RuntimeDateFormat>(
  options: DateOptions<Format>,
): DateSchema<Format>;
export function date(
  options: DateOptions<RuntimeDateFormat> = {},
  formatStringMode: DateFormatStringMode = 'date',
): DateSchema<RuntimeDateFormat> {
  const format = resolveDateFormat(options, formatStringMode);

  return createRuntimeSchemaBuilder<Date, 'date', DateSchemaOptions>({
    type: 'date',
    options: { format },
    codec: getDateCodec(format, formatStringMode),
    validateDefault(value, context) {
      validateDateDefault(value, context);
    },
  });
}

function getDateCodec(
  format: RuntimeDateFormat,
  formatStringMode: DateFormatStringMode,
): RuntimeSchemaCodec<Date> {
  if (isDateFormatCodec(format)) {
    return createCustomDateCodec(format);
  }

  if (isDateFormatString(format) && !isBuiltInDateFormat(format)) {
    return createDateFormatStringCodec(format, formatStringMode);
  }

  if (format === 'date-time') {
    return dateTimeCodec;
  }

  if (format === 'unix-seconds') {
    return unixSecondsCodec;
  }

  if (format === 'unix-ms') {
    return unixMsCodec;
  }

  return dateOnlyCodec;
}

function createDateFormatStringCodec(
  format: DateFormatString,
  mode: DateFormatStringMode,
): RuntimeSchemaCodec<Date> {
  return {
    parse(input, context) {
      return parseDateFormatString(input, format, mode, {
        code: context.errorCode,
        path: context.path,
      });
    },

    normalize(input, context) {
      return validateDate(input, context);
    },

    serialize(input, context) {
      return serializeDateFormatString(input, format, mode, {
        code: context.errorCode,
        path: context.path,
      });
    },
  };
}

function createCustomDateCodec(format: DateFormatCodec): RuntimeSchemaCodec<Date> {
  return {
    parse(input, context) {
      return parseCustomDate(input, format, { code: context.errorCode, path: context.path });
    },

    normalize(input, context) {
      return validateDate(input, context);
    },

    serialize(input, context) {
      return serializeCustomDate(input, format, { code: context.errorCode, path: context.path });
    },
  };
}

function resolveDateFormat(
  options: DateOptions<RuntimeDateFormat>,
  formatStringMode: DateFormatStringMode,
): RuntimeDateFormat {
  if (!isDateOptions(options)) {
    throw new UrlKitError('invalid-descriptor', 'Date options must be an object.');
  }

  const format = options.format ?? 'date';

  if (isBuiltInDateFormat(format) || isDateFormatCodec(format)) {
    return format;
  }

  if (isDateFormatString(format)) {
    validateDateFormatString(format, formatStringMode);
    return format;
  }

  throw new UrlKitError(
    'invalid-descriptor',
    'Date format must be a supported built-in format, a supported format string, or an explicit codec.',
  );
}

function isDateOptions(input: unknown): input is DateOptions<RuntimeDateFormat> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isDateFormatString(input: unknown): input is DateFormatString {
  return typeof input === 'string';
}

function isBuiltInDateFormat(input: unknown): input is BuiltInRuntimeDateFormat {
  return (
    input === 'date' || input === 'date-time' || input === 'unix-seconds' || input === 'unix-ms'
  );
}

function isDateFormatCodec(input: unknown): input is DateFormatCodec {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as Partial<DateFormatCodec>).parse === 'function' &&
    typeof (input as Partial<DateFormatCodec>).serialize === 'function'
  );
}

function validateDate(input: unknown, context: RuntimeSchemaValueContext): Date {
  if (input instanceof Date && Number.isFinite(input.getTime())) {
    return input;
  }

  throw createSchemaValueError(context.errorCode, 'Expected a valid Date value.', context.path);
}

function validateDateDefault(value: Date, context: RuntimeDefaultValidationContext): void {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Date schema default must be a valid Date.', {
    path: context.path,
  });
}
