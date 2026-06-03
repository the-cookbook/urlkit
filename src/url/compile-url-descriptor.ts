import { compileHashDescriptor } from '../hash/compile-hash-descriptor.js';
import type { CompiledHashDescriptor } from '../hash/contracts.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import type { CompiledSearchSchema, RuntimeSearchSchema } from '../search/contracts.js';
import type { UrlMode } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compilePath } from './compile-path.js';
import type { CompiledPath, NormalizedUrlDescriptor } from './contracts.js';

export interface CompiledUrlDescriptor<Mode extends UrlMode = UrlMode> {
  readonly mode: Mode;
  readonly pattern: Mode extends 'path' ? string : undefined;
  readonly path: Mode extends 'path' ? CompiledPath : undefined;
  readonly searchSchema?: RuntimeSearchSchema;
  readonly search?: CompiledSearchSchema;
  readonly hash?: CompiledHashDescriptor;
}

export function compileUrlDescriptor<Mode extends UrlMode>(
  descriptor: NormalizedUrlDescriptor<Mode>,
): CompiledUrlDescriptor<Mode> {
  assertNormalizedUrlDescriptor(descriptor);

  const path = compileUrlPath(descriptor);
  const search = descriptor.search ? compileSearchSchema(descriptor.search) : undefined;
  const hash = descriptor.hash ? compileHashDescriptor(descriptor.hash) : undefined;

  return Object.freeze({
    mode: descriptor.mode,
    pattern: descriptor.pattern,
    path,
    ...(descriptor.search ? { searchSchema: descriptor.search, search } : {}),
    ...(hash ? { hash } : {}),
  }) as CompiledUrlDescriptor<Mode>;
}

function compileUrlPath<Mode extends UrlMode>(
  descriptor: NormalizedUrlDescriptor<Mode>,
): CompiledUrlDescriptor<Mode>['path'] {
  if (descriptor.mode === 'path') {
    if (descriptor.path) {
      return descriptor.path;
    }

    if (typeof descriptor.pattern === 'string') {
      return compilePath(descriptor.pattern) as unknown as CompiledUrlDescriptor<Mode>['path'];
    }

    throw new UrlKitError(
      'invalid-descriptor',
      'Path URL descriptor must include a path pattern.',
      { path: ['path'] },
    );
  }

  return undefined as CompiledUrlDescriptor<Mode>['path'];
}

function assertNormalizedUrlDescriptor(input: unknown): asserts input is NormalizedUrlDescriptor {
  if (!isRecord(input)) {
    throw new UrlKitError('invalid-descriptor', 'URL descriptor must be an object.', { path: [] });
  }

  if (input.mode !== 'path' && input.mode !== 'pathless') {
    throw new UrlKitError('invalid-descriptor', 'URL descriptor mode must be path or pathless.', {
      path: ['mode'],
    });
  }

  if (input.mode === 'path' && typeof input.pattern !== 'string') {
    throw new UrlKitError('invalid-descriptor', 'Path URL descriptor pattern must be a string.', {
      path: ['pattern'],
    });
  }

  if (input.mode === 'pathless' && input.pattern !== undefined) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Pathless URL descriptor pattern must be undefined.',
      { path: ['pattern'] },
    );
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
