import type { EmptyParams } from '../contracts.js';
import { url } from '../url/create-url.js';
import type { CreateUrlOptions, UrlContract } from '../url/contracts.js';
import type { InferRuntimeSearch, RuntimeSearchSchema } from './contracts.js';

export function search<const Schema extends RuntimeSearchSchema>(
  schema: Schema,
  options?: CreateUrlOptions,
): UrlContract<'pathless', string, EmptyParams, InferRuntimeSearch<Schema>, undefined> {
  return url(
    {
      search: schema,
    },
    options,
  );
}
