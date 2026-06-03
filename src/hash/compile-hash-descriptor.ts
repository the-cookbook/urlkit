import { UrlKitError } from '../errors/url-kit-error.js';
import type { RuntimeSchemaBuilder } from '../schema/contracts.js';
import { getRuntimeSchemaInternals } from '../schema/get-runtime-schema-internals.js';
import type { StaticHashDescriptor } from '../static/contracts.js';
import { compileNormalizedHashDescriptor } from './compile-normalized-hash-descriptor.js';
import { compileRuntimeHashDescriptor } from './compile-runtime-hash-descriptor.js';
import { compileStaticHashDescriptor } from './compile-static-hash-descriptor.js';
import type { CompiledHashDescriptor, HashDescriptorInput } from './contracts.js';
import { isNormalizedHashDescriptor } from './is-normalized-hash-descriptor.js';

const HASH_PATH = Object.freeze(['hash']);

export function compileHashDescriptor(
  descriptor?: HashDescriptorInput,
): CompiledHashDescriptor<string | undefined> {
  if (descriptor === undefined) {
    return compileNormalizedHashDescriptor({ kind: 'string', presence: 'optional' });
  }

  const runtimeKind = getRuntimeSchemaKind(descriptor);

  if (runtimeKind) {
    if (runtimeKind !== 'string' && runtimeKind !== 'enum') {
      throw new UrlKitError('invalid-descriptor', 'Hash schema must be a string or enum schema.', {
        path: HASH_PATH,
      });
    }

    return compileRuntimeHashDescriptor(
      descriptor as RuntimeSchemaBuilder<unknown, 'string' | 'enum'>,
    );
  }

  if (isNormalizedHashDescriptor(descriptor)) {
    return compileNormalizedHashDescriptor(descriptor);
  }

  return compileNormalizedHashDescriptor(
    compileStaticHashDescriptor(descriptor as StaticHashDescriptor),
  );
}

function getRuntimeSchemaKind(input: unknown): string | undefined {
  try {
    const internals = getRuntimeSchemaInternals(input as RuntimeSchemaBuilder<unknown>);
    return internals.kind;
  } catch {
    return undefined;
  }
}
