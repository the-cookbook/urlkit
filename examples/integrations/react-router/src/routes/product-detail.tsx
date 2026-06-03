import { Link, useLoaderData } from 'react-router';
import type { LoaderFunctionArgs, Params } from 'react-router';
import { ProductDetailsUrl, ProductFiltersUrl } from '@shared/url-contracts';
import { findProduct } from '@shared/product-data';
import type { Product } from '@shared/product-data';

interface LoaderData {
  readonly product: Product;
}

interface ProductDetailsLoaderArgs extends Omit<LoaderFunctionArgs, 'params'> {
  params: Params<'slug'>;
}

export async function loader({ params }: ProductDetailsLoaderArgs): Promise<LoaderData> {
  const normalized = ProductDetailsUrl.safeNormalize({
    params: {
      slug: params.slug!,
    },
  });

  if (!normalized.success) {
    throw new Response(normalized.error.message, { status: 404 });
  }

  const product = findProduct(normalized.data.params.slug);

  if (!product) {
    throw new Response('Product not found.', { status: 404 });
  }

  return { product };
}

export function ProductDetailRoute() {
  const { product } = useLoaderData() as LoaderData;

  return (
    <main>
      <Link
        className="back-link"
        to={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}
      >
        Back to products
      </Link>
      <section className="hero product-hero">
        <p className="eyebrow">
          {product.brand} · {product.category}
        </p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="product-meta">
          ${product.price} · Rating {product.rating} ·{' '}
          {product.inStock ? 'In stock' : 'Out of stock'}
        </p>
      </section>
      <nav className="tabs" aria-label="Product sections">
        <Link to={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'overview' })}>
          Overview
        </Link>
        <Link to={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'reviews' })}>
          Reviews
        </Link>
        <Link to={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'shipping' })}>
          Shipping
        </Link>
      </nav>
      <section className="panel" id="overview">
        <h2>Overview</h2>
        <p>{product.description}</p>
      </section>
      <section className="panel" id="reviews">
        <h2>Reviews</h2>
        <p>Average rating: {product.rating}</p>
      </section>
      <section className="panel" id="shipping">
        <h2>Shipping</h2>
        <p>Ships in 2-4 business days.</p>
      </section>
    </main>
  );
}
