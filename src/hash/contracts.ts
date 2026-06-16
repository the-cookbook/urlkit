import type { BuildUrlOptions, InvalidHashBehavior } from '../contracts.js';
import type { StaticHashDescriptor } from '../static/contracts.js';
import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaPresence,
} from '../schema/contracts.js';

export type HashSchema = RuntimeSchemaBuilder<any, any, any, any>;

export type HashDescriptorInput = HashSchema | StaticHashDescriptor | NormalizedHashDescriptor;

export type HashType = 'string' | 'enum';

export interface NormalizedHashDescriptor<Hash = unknown> {
  readonly type: HashType;
  readonly presence: RuntimeSchemaPresence;
  readonly values?: readonly string[];
  readonly defaultValue?: Hash;
}

export interface CompiledHashDescriptor<Hash = unknown> {
  readonly descriptor: NormalizedHashDescriptor<Hash>;
  readonly parse: (input: unknown) => Hash;
  readonly normalize: (input: unknown) => Hash;
  readonly serialize: (input: unknown) => string | undefined;
  readonly isDefault: (input: unknown) => boolean;
}

export interface ParseHashOptions {
  readonly invalidHash?: InvalidHashBehavior;
}

export type BuildHashOptions = BuildUrlOptions;

export type RuntimeHashSchemaDescriptor = NormalizedRuntimeSchemaDescriptor<'string' | 'enum'>;
