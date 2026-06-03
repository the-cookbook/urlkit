import { ApiProductFiltersUrl } from '@shared/url-contracts';
import { listProducts } from '@shared/product-data';

export function GET(request: Request): Response {
  const parsed = ApiProductFiltersUrl.safeParseRequest(request, { unknownSearch: 'error' });

  if (!parsed.success) {
    return Response.json(
      { code: parsed.error.code, message: parsed.error.message },
      { status: 400 },
    );
  }

  return Response.json({ state: parsed.data, result: listProducts(parsed.data.search) });
}
