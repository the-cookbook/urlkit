import { createConstraint, registerPathConstraint, url } from '@cookbook/urlkit';
import { createRouteUrlContract } from '@cookbook/urlkit/router-runtime';
import { compileStaticUrl } from '@cookbook/urlkit/static';

const slugConstraint = createConstraint({
  parse(paramName, value) {
    if (!/^[a-z0-9-]+$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a slug.`);
    }
  },
  verify(paramName, params) {
    if (params.trim()) {
      throw new Error(`Constraint "slug" declared for "${paramName}" does not accept arguments.`);
    }
  },
  toRegExp() {
    return '[a-z0-9-]+';
  },
});

registerPathConstraint('slug', slugConstraint);

const ArticleUrl = url({
  path: '/articles/{slug:slug}',
});

const articleState = ArticleUrl.parse('/articles/urlkit-custom-path-constraints');
const articleHref = ArticleUrl.build({
  params: {
    slug: articleState.params.slug,
  },
});
const invalidArticle = ArticleUrl.safeParse('/articles/InvalidSlug');

const skuConstraint = createConstraint({
  parse(paramName, value) {
    if (!/^sku-[0-9]+$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a SKU.`);
    }
  },
  verify(_paramName, params) {
    if (params.trim()) {
      throw new Error('SKU constraint does not accept arguments.');
    }
  },
  toRegExp() {
    return 'sku-[0-9]+';
  },
});

const ProductUrl = url(
  {
    path: '/products/{sku:sku}',
  },
  {
    pathConstraints: {
      sku: skuConstraint,
    },
  },
);

const productState = ProductUrl.parse('/products/sku-42');

const compiledStaticUrl = compileStaticUrl({
  path: '/docs/{slug:slug}',
});

const routeUrl = createRouteUrlContract({
  path: '/blog/{slug:slug}',
} as const);

const routeState = routeUrl.parse('/blog/router-runtime-path-constraints');

export {
  ArticleUrl,
  ProductUrl,
  articleHref,
  articleState,
  compiledStaticUrl,
  invalidArticle,
  productState,
  routeState,
  routeUrl,
  slugConstraint,
};
