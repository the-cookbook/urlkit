import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import type { ParseRequestOptions, UrlContract, UrlMode, UrlState } from '../../shared/urlkit.js';

export type UrlKitState = UrlState<unknown, unknown, unknown, unknown>;

export interface UrlKitFastifyMiddlewareOptions extends Omit<ParseRequestOptions, 'baseUrl'> {
  readonly baseUrl?: string | ((request: FastifyRequest) => string);
  readonly getUrl?: (request: FastifyRequest) => string;
  readonly statusCode?: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    readonly urlKit?: UrlKitState;
  }
}

export function createUrlKitMiddleware<
  T extends UrlContract<UrlMode, any, any, any, any, any, any>,
>(contract: T, options: UrlKitFastifyMiddlewareOptions = {}): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = contract.safeParseRequest(
      {
        url: options.getUrl?.(request) ?? request.url,
      },
      {
        ...options,
        baseUrl: resolveBaseUrl(request, options.baseUrl),
      },
    );

    if (!parsed.success) {
      await reply.status(options.statusCode ?? 400).send({
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
  };
}

function resolveBaseUrl(
  request: FastifyRequest,
  baseUrl: UrlKitFastifyMiddlewareOptions['baseUrl'],
): string {
  if (typeof baseUrl === 'function') {
    return baseUrl(request);
  }

  if (baseUrl) {
    return baseUrl;
  }

  const host = request.headers.host || 'localhost:3000';
  const forwardedProtocol = request.headers['x-forwarded-proto'];
  const protocol = Array.isArray(forwardedProtocol)
    ? forwardedProtocol[0] || 'http'
    : forwardedProtocol || 'http';

  return `${protocol}://${host}`;
}
