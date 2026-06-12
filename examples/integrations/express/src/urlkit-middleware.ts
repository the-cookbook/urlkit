import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParseRequestOptions, UrlContract, UrlMode, UrlState } from '../../shared/urlkit.js';

export type UrlKitState = UrlState<unknown, unknown, unknown, unknown>;

export interface UrlKitExpressMiddlewareOptions extends Omit<ParseRequestOptions, 'baseUrl'> {
  readonly baseUrl?: string | ((request: Request) => string);
  readonly getUrl?: (request: Request) => string;
  readonly statusCode?: number;
}

declare global {
  namespace Express {
    interface Request {
      readonly urlKit?: UrlKitState;
    }
  }
}

export function createUrlKitMiddleware<
  T extends UrlContract<UrlMode, any, any, any, any, any, any>,
>(contract: T, options: UrlKitExpressMiddlewareOptions = {}): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    const parsed = contract.safeParseRequest(
      {
        url: options.getUrl?.(request) || request.originalUrl || request.url,
      },
      {
        ...options,
        baseUrl: resolveBaseUrl(request, options.baseUrl),
      },
    );

    if (!parsed.success) {
      response.status(options.statusCode ?? 400).json({
        code: parsed.error.code,
        message: parsed.error.message,
      });

      return;
    }

    Object.defineProperty(request, 'urlKit', {
      configurable: true,
      enumerable: false,
      value: parsed.data,
    });

    next();
  };
}

function resolveBaseUrl(
  request: Request,
  baseUrl: UrlKitExpressMiddlewareOptions['baseUrl'],
): string {
  if (typeof baseUrl === 'function') {
    return baseUrl(request);
  }

  if (baseUrl) {
    return baseUrl;
  }

  return `${request.protocol}://${request.get('host')}`;
}
