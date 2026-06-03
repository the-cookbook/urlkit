import { createConstraint, hasConstraint, registerConstraint } from '@cookbook/pathkit/constraints';
import { UrlKitError } from '../errors/url-kit-error.js';

const numberConstraint = createConstraint({
  parse(paramName, value, params) {
    numberConstraint.verify(paramName, params);

    const serialized = String(value);

    if (!isFinitePathNumber(serialized)) {
      throw new UrlKitError(
        'invalid-param',
        `Path parameter "${paramName}" must be a finite number.`,
        {
          path: ['params', paramName],
        },
      );
    }
  },
  verify(paramName, params) {
    if (params.trim()) {
      throw new UrlKitError(
        'invalid-descriptor',
        `Constraint 'number' declared for '${paramName}' parameter does not accept arguments.`,
        { path: ['path', paramName] },
      );
    }
  },
  toRegExp() {
    return '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
  },
});

export function registerUrlKitPathConstraints(): void {
  if (!hasConstraint('number')) {
    registerConstraint('number', numberConstraint);
  }
}

function isFinitePathNumber(value: string): boolean {
  if (!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
    return false;
  }

  return Number.isFinite(Number(value));
}
