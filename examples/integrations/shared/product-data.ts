import type { ProductFiltersSearch } from './url-contracts.js';

export interface Product {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly price: number;
  readonly rating: number;
  readonly tags: readonly string[];
  readonly inStock: boolean;
  readonly createdAt: string;
  readonly description: string;
}

export interface ProductListResult {
  readonly items: readonly Product[];
  readonly totalItems: number;
  readonly page: number;
  readonly totalPages: number;
  readonly pageSize: number;
}

const pageSize = 4;

export const products: readonly Product[] = [
  {
    id: 1,
    slug: 'red-wing-iron-ranger',
    name: 'Red Wing Iron Ranger',
    brand: 'Red Wing',
    category: 'boots',
    price: 349,
    rating: 4.9,
    tags: ['leather', 'heritage', 'sale'],
    inStock: true,
    createdAt: '2026-05-20',
    description: 'Goodyear-welted leather boot built for long-term wear.',
  },
  {
    id: 2,
    slug: 'nike-killshot-2',
    name: 'Nike Killshot 2',
    brand: 'Nike',
    category: 'sneakers',
    price: 90,
    rating: 4.5,
    tags: ['casual', 'leather'],
    inStock: true,
    createdAt: '2026-04-18',
    description: 'Low-profile court sneaker with classic everyday styling.',
  },
  {
    id: 3,
    slug: 'patagonia-black-hole-pack',
    name: 'Patagonia Black Hole Pack',
    brand: 'Patagonia',
    category: 'bags',
    price: 169,
    rating: 4.8,
    tags: ['travel', 'weather-resistant'],
    inStock: false,
    createdAt: '2026-03-11',
    description: 'Durable daypack for commuting, travel, and weekend trips.',
  },
  {
    id: 4,
    slug: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'audio',
    price: 399,
    rating: 4.7,
    tags: ['wireless', 'noise-cancelling'],
    inStock: true,
    createdAt: '2026-02-22',
    description: 'Noise-cancelling headphones for work and travel.',
  },
  {
    id: 5,
    slug: 'filson-rugged-twill-briefcase',
    name: 'Filson Rugged Twill Briefcase',
    brand: 'Filson',
    category: 'bags',
    price: 495,
    rating: 4.6,
    tags: ['work', 'heritage', 'leather'],
    inStock: true,
    createdAt: '2026-01-31',
    description: 'Structured briefcase with bridle leather handles.',
  },
  {
    id: 6,
    slug: 'adidas-samba-og',
    name: 'Adidas Samba OG',
    brand: 'Adidas',
    category: 'sneakers',
    price: 100,
    rating: 4.4,
    tags: ['casual', 'gum-sole'],
    inStock: true,
    createdAt: '2026-06-01',
    description: 'Iconic terrace sneaker with leather and suede details.',
  },
];

export function listProducts(filters: ProductFiltersSearch): ProductListResult {
  let matches = [...products];

  if (filters.q) {
    const query = filters.q.toLowerCase();
    matches = matches.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });
  }

  if (filters.inStock) {
    matches = matches.filter((product) => product.inStock);
  }

  if (filters.tags.length) {
    matches = matches.filter((product) => {
      return filters.tags.every((tag) => product.tags.includes(tag));
    });
  }

  const brands = filters.filter?.brand;

  if (brands?.length) {
    matches = matches.filter((product) => brands.includes(product.brand));
  }

  const minimumPrice = filters.filter?.price?.min;

  if (minimumPrice) {
    matches = matches.filter((product) => product.price >= minimumPrice);
  }

  const maximumPrice = filters.filter?.price?.max;

  if (maximumPrice) {
    matches = matches.filter((product) => product.price <= maximumPrice);
  }

  matches = sortProducts(matches, filters.sort);

  const totalItems = matches.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const start = (page - 1) * pageSize;
  const items = matches.slice(start, start + pageSize);

  return { items, totalItems, page, totalPages, pageSize };
}

export function findProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

function sortProducts(input: readonly Product[], sort: ProductFiltersSearch['sort']): Product[] {
  const output = [...input];

  if (sort === 'newest') {
    return output.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  if (sort === 'price-asc') {
    return output.sort((left, right) => left.price - right.price);
  }

  if (sort === 'price-desc') {
    return output.sort((left, right) => right.price - left.price);
  }

  return output.sort((left, right) => right.rating - left.rating);
}
