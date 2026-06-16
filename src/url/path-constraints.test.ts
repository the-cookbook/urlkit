import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  createConstraint,
  createPathConstraint,
  getPathConstraint,
  hasPathConstraint,
  registerPathConstraint,
  registerPathConstraints,
  resetPathConstraints,
  unregisterPathConstraint,
} from './path-constraints.js';

const createSlugConstraint = () =>
  createPathConstraint({
    parse(paramName, value) {
      if (!/^[a-z0-9-]+$/.test(String(value))) {
        throw new Error(`Path parameter "${paramName}" must be a slug.`);
      }
    },
    verify(paramName, params) {
      if (params.trim()) {
        throw new Error(`Constraint declared for "${paramName}" does not accept arguments.`);
      }
    },
    toRegExp() {
      return '[a-z0-9-]+';
    },
  });

describe('path public exports', () => {
  it('exports helpers', () => {
    // "createConstraint" is flagged to be removed on v3
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(createConstraint).toBeTypeOf('function');
    expect(createPathConstraint).toBeTypeOf('function');
    expect(hasPathConstraint).toBeTypeOf('function');
    expect(getPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraints).toBeTypeOf('function');
    expect(resetPathConstraints).toBeTypeOf('function');
    expect(unregisterPathConstraint).toBeTypeOf('function');
  });
});

describe('path constraint registration', () => {
  it('registers global path constraints', () => {
    const constraint = createSlugConstraint();

    registerPathConstraint('urlkitslugglobalone', constraint);

    expect(hasPathConstraint('urlkitslugglobalone')).toBe(true);
  });

  it('registers global path constraints in batches', () => {
    const slug = createSlugConstraint();
    const code = createSlugConstraint();

    registerPathConstraints({
      urlkitslugbatchone: slug,
      urlkitslugbatchtwo: code,
    });

    expect(hasPathConstraint('urlkitslugbatchone')).toBe(true);
    expect(hasPathConstraint('urlkitslugbatchtwo')).toBe(true);
  });

  it('allows duplicate registration with the same constraint instance', () => {
    const constraint = createSlugConstraint();

    registerPathConstraint('urlkitslugduplicate', constraint);

    expect(() => registerPathConstraint('urlkitslugduplicate', constraint)).not.toThrow();
  });

  it('rejects duplicate registration with a different constraint instance', () => {
    registerPathConstraint('urlkitslugconflict', createSlugConstraint());

    expect(() => registerPathConstraint('urlkitslugconflict', createSlugConstraint())).toThrow(
      UrlKitError,
    );
  });

  it('allows explicit overwrite when replacing a global constraint', () => {
    registerPathConstraint('urlkitslugoverwrite', createSlugConstraint());

    expect(() =>
      registerPathConstraint('urlkitslugoverwrite', createSlugConstraint(), { overwrite: true }),
    ).not.toThrow();
  });

  it('rejects invalid constraint registration input', () => {
    expect(() => registerPathConstraint('', createSlugConstraint())).toThrow(UrlKitError);
    expect(() => registerPathConstraints(null as never)).toThrow(UrlKitError);
    expect(() =>
      registerPathConstraint('urlkitinvalidconstraint', (() => undefined) as never),
    ).toThrow(UrlKitError);
  });

  it(' exposes registry helpers', () => {
    const slug = createPathConstraint({
      parse(_name, value) {
        if (typeof value !== 'string' || !/^[a-z0-9-]+$/.test(value)) {
          throw new Error('Invalid slug.');
        }
      },
      verify() {},
      toRegExp() {
        return '[a-z0-9-]+';
      },
    });

    registerPathConstraints({ slug });

    expect(hasPathConstraint('slug')).toBe(true);
    expect(getPathConstraint('slug')).toBe(slug);

    unregisterPathConstraint('slug');
    expect(hasPathConstraint('slug')).toBe(false);
  });
});
