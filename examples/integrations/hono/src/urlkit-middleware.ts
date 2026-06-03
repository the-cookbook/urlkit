import type { Context, MiddlewareHandler } from 'hono';
import type { ParseRequestOptions, UrlContract, UrlMode, UrlState } from '../../shared/urlkit.js';

export type UrlKitState = UrlState<unknown, unknown, unknown, unknown>;

export interface UrlKitHonoVariables {
  readonly urlKit: UrlKitState;
}

export interface UrlKitHonoMiddlewareOptions extends ParseRequestOptions {
  readonly getUrl?: (context: Context<{ Variables: UrlKitHonoVariables }>) => string;
  readonly statusCode?: 400 | 401 | 403 | 404 | 422;
}

export function createUrlKitMiddleware<
  T extends UrlContract<UrlMode, any, any, any, any, any, any>,
>(
  contract: T,
  options: UrlKitHonoMiddlewareOptions = {},
): MiddlewareHandler<{ Variables: UrlKitHonoVariables }> {
  return async (context: Context<{ Variables: UrlKitHonoVariables }>, next) => {
    const parsed = contract.safeParseRequest(
      options.getUrl ? { url: options.getUrl(context) } : context.req.raw,
      options,
    );

    if (!parsed.success) {
      return context.json(
        {
          code: parsed.error.code,
          message: parsed.error.message,
        },
        options.statusCode ?? 400,
      );
    }

    context.set('urlKit', parsed.data);
    await next();
  };
}
