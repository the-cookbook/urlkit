import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductDetailsUrl, ProductFiltersUrl } from '@shared/url-contracts';
import { findProduct } from '@shared/product-data';

interface ProductPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const normalized = ProductDetailsUrl.safeNormalize({ params: await params });

  if (!normalized.success) {
    notFound();
  }

  const product = findProduct(normalized.data.params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <Link
        className="back-link"
        href={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}
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
        <Link href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'overview' })}>
          Overview
        </Link>
        <Link href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'reviews' })}>
          Reviews
        </Link>
        <Link href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'shipping' })}>
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
