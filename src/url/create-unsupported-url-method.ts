import { UrlKitError } from '../errors/url-kit-error.js';

export function createUnsupportedUrlMethod(name: string): (...args: readonly unknown[]) => never {
  return () => {
    throw new UrlKitError('invalid-url', `UrlContract.${name} is not implemented yet.`);
  };
}
