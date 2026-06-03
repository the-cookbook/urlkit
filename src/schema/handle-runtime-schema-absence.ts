import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaOptions,
  RuntimeSchemaValueOptions,
} from './contracts.js';

export interface RuntimeSchemaAbsenceResult<Value> {
  readonly handled: boolean;
  readonly value?: Value | undefined;
}

export function handleRuntimeSchemaAbsence<
  Value,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
>(
  descriptor: NormalizedRuntimeSchemaDescriptor<string, Options, Value>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): RuntimeSchemaAbsenceResult<Value> {
  if (input !== undefined && input !== null) {
    return { handled: false };
  }

  if (descriptor.presence === 'optional') {
    return { handled: true, value: undefined };
  }

  if (descriptor.presence === 'defaulted') {
    return { handled: true, value: descriptor.defaultValue };
  }

  const path = [...(options.path ?? [])];

  if (input === null) {
    throw new UrlKitError(options.errorCode ?? 'invalid-search', 'Required value cannot be null.', {
      path,
    });
  }

  throw new UrlKitError(options.missingCode ?? 'missing-search', 'Required value is missing.', {
    path,
  });
}
