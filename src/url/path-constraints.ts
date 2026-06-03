import { getConstraint, hasConstraint, registerConstraint } from '@cookbook/pathkit/constraints';
import type { ConstraintValidation } from '@cookbook/pathkit';
import type { PathConstraintMap, RegisterPathConstraintOptions } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export function registerPathConstraint(
  name: string,
  constraint: ConstraintValidation,
  options: RegisterPathConstraintOptions = {},
): void {
  assertPathConstraintName(name);
  assertPathConstraint(name, constraint);

  const existing = getConstraint(name);

  if (existing && existing !== constraint && !options.overwrite) {
    throw new UrlKitError(
      'invalid-descriptor',
      `Path constraint "${name}" is already registered.`,
      {
        path: ['pathConstraints', name],
      },
    );
  }

  if (existing === constraint && !options.overwrite) {
    return;
  }

  registerConstraint(name, constraint);
}

export function registerPathConstraints(
  constraints: PathConstraintMap,
  options: RegisterPathConstraintOptions = {},
): void {
  assertPathConstraintMap(constraints);

  for (const [name, constraint] of Object.entries(constraints)) {
    registerPathConstraint(name, constraint, options);
  }
}

export function hasPathConstraint(name: string): boolean {
  return hasConstraint(name);
}

function assertPathConstraintName(name: unknown): asserts name is string {
  if (typeof name === 'string' && name.trim()) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Path constraint name must be a non-empty string.', {
    path: ['pathConstraints'],
  });
}

function assertPathConstraintMap(input: unknown): asserts input is PathConstraintMap {
  if (isRecord(input)) {
    return;
  }

  throw new UrlKitError('invalid-descriptor', 'Path constraints must be an object.', {
    path: ['pathConstraints'],
  });
}

function assertPathConstraint(
  name: string,
  constraint: unknown,
): asserts constraint is ConstraintValidation {
  if (
    typeof constraint === 'function' &&
    typeof (constraint as Partial<ConstraintValidation>).verify === 'function' &&
    typeof (constraint as Partial<ConstraintValidation>).toRegExp === 'function'
  ) {
    return;
  }

  throw new UrlKitError(
    'invalid-descriptor',
    `Path constraint "${name}" must be created with createConstraint().`,
    {
      path: ['pathConstraints', name],
    },
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
