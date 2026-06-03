import { createConstraint } from '@cookbook/pathkit/constraints';
import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import {
  hasPathConstraint,
  registerPathConstraint,
  registerPathConstraints,
} from './path-constraints.js';

const createSlugConstraint = () =>
  createConstraint({
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
});
