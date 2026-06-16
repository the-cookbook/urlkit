import type { UrlPathMatchOptions } from '../contracts.js';

export type PathMatchOptionsFromOptions<Options> = Options extends undefined
  ? undefined
  : Options extends object
    ? 'pathMatch' extends keyof Options
      ? Options extends { readonly pathMatch?: infer PathMatchOptions }
        ? Extract<PathMatchOptions, UrlPathMatchOptions>
        : undefined
      : undefined
    : undefined;
