import { redirect, type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  throw redirect(`/products${url.search}`);
}

export default function IndexRoute() {
  return null;
}
