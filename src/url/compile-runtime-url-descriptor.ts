import { UrlKitError } from '../errors/url-kit-error.js';
import { compileHashDescriptor } from '../hash/compile-hash-descriptor.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import { compilePath } from './compile-path.js';
import type {
  CreateUrlOptions,
  NormalizedUrlDescriptor,
  RuntimeUrlDescriptor,
  UrlModeFromRuntimeDescriptor,
} from './contracts.js';

export function compileRuntimeUrlDescriptor<Descriptor extends RuntimeUrlDescriptor>(
  descriptor: Descriptor,
  options: CreateUrlOptions = {},
): NormalizedUrlDescriptor<UrlModeFromRuntimeDescriptor<Descriptor>> {
  assertRuntimeUrlDescriptor(descriptor);

  const mode = Object.prototype.hasOwnProperty.call(descriptor, 'path') ? 'path' : 'pathless';

  if (descriptor.search) {
    compileSearchSchema(descriptor.search);
  }

  const normalized = {
    mode,
    pattern: mode === 'path' ? descriptor.path : undefined,
    ...(mode === 'path' && descriptor.path !== undefined
      ? {
          path: compilePath(descriptor.path, {
            params: 'parsed',
            ...(options.pathConstraints ? { pathConstraints: options.pathConstraints } : {}),
            ...(options.pathMatch ? { pathMatch: options.pathMatch } : {}),
          }),
        }
      : {}),
    ...(descriptor.search ? { search: descriptor.search } : {}),
    ...(descriptor.hash ? { hash: compileHashDescriptor(descriptor.hash).descriptor } : {}),
  } as NormalizedUrlDescriptor<UrlModeFromRuntimeDescriptor<Descriptor>>;

  return Object.freeze(normalized);
}

function assertRuntimeUrlDescriptor(input: unknown): asserts input is RuntimeUrlDescriptor {
  if (!isRecord(input)) {
    throw new UrlKitError('invalid-descriptor', 'Runtime URL descriptor must be an object.', {
      path: [],
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, 'path') && typeof input.path !== 'string') {
    throw new UrlKitError('invalid-descriptor', 'Runtime URL descriptor path must be a string.', {
      path: ['path'],
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(input, 'search') &&
    input.search !== undefined &&
    !isRecord(input.search)
  ) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Runtime URL descriptor search must be an object.',
      { path: ['search'] },
    );
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
