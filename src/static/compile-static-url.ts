import { UrlKitError } from '../errors/url-kit-error.js';
import type { NormalizedUrlDescriptor } from '../url/contracts.js';
import type {
  CompileStaticUrlOptions,
  StaticUrlDescriptor,
  StaticUrlModeFromDescriptor,
} from './contracts.js';
import { compilePath } from '../url/compile-path.js';
import { compileStaticHash } from './compile-static-hash.js';
import { compileStaticSearch } from './compile-static-search.js';

export function compileStaticUrl<Descriptor extends StaticUrlDescriptor>(
  descriptor: Descriptor,
  options: CompileStaticUrlOptions = {},
): NormalizedUrlDescriptor<StaticUrlModeFromDescriptor<Descriptor>> {
  assertStaticUrlDescriptor(descriptor);

  const mode = Object.prototype.hasOwnProperty.call(descriptor, 'path') ? 'path' : 'pathless';
  const normalized = {
    mode,
    pattern: mode === 'path' ? descriptor.path : undefined,
    ...(mode === 'path' && descriptor.path !== undefined
      ? {
          path: compilePath(descriptor.path, {
            params: 'parsed',
            ...(options.pathConstraints ? { pathConstraints: options.pathConstraints } : {}),
          }),
        }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(descriptor, 'search')
      ? { search: compileStaticSearch(descriptor.search ?? {}) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(descriptor, 'hash') && descriptor.hash !== undefined
      ? { hash: compileStaticHash(descriptor.hash) }
      : {}),
  } as NormalizedUrlDescriptor<StaticUrlModeFromDescriptor<Descriptor>>;

  return Object.freeze(normalized);
}

function assertStaticUrlDescriptor(input: unknown): asserts input is StaticUrlDescriptor {
  if (!isRecord(input)) {
    throw new UrlKitError('invalid-descriptor', 'Static URL descriptor must be an object.', {
      path: [],
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, 'path') && typeof input.path !== 'string') {
    throw new UrlKitError('invalid-descriptor', 'Static URL descriptor path must be a string.', {
      path: ['path'],
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(input, 'search') &&
    input.search !== undefined &&
    !isRecord(input.search)
  ) {
    throw new UrlKitError('invalid-descriptor', 'Static URL descriptor search must be an object.', {
      path: ['search'],
    });
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
