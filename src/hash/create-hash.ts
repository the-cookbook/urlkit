import type { EmptyParams } from '../contracts.js';
import type { InferRuntimeSchemaValue } from '../schema/contracts.js';
import { url } from '../url/create-url.js';
import type {
  CreateUrlOptions,
  HashBuildInputFromRuntimeSchema,
  UrlContract,
} from '../url/contracts.js';
import type { HashSchema } from './contracts.js';

export function hash<const Schema extends HashSchema>(
  schema: Schema,
  options?: CreateUrlOptions,
): UrlContract<
  'pathless',
  string,
  EmptyParams,
  EmptyParams,
  InferRuntimeSchemaValue<Schema>,
  EmptyParams,
  HashBuildInputFromRuntimeSchema<Schema>
> {
  return url(
    {
      hash: schema,
    },
    options,
  ) as UrlContract<
    'pathless',
    string,
    EmptyParams,
    EmptyParams,
    InferRuntimeSchemaValue<Schema>,
    EmptyParams,
    HashBuildInputFromRuntimeSchema<Schema>
  >;
}
