import { url } from '@cookbook/urlkit';

const OptionalProductUrl = url({
  path: '/products/{id:min(1):max(10)?}',
});

const RegexMinUserUrl = url({
  path: '/users/{id:regex(\\d):min(1)}',
});

const DecimalPriceUrl = url({
  path: '/prices/{amount:decimal:min(-10):max(10)}',
});

const UuidUserUrl = url({
  path: '/users/{id:uuid}',
});

const ArticleSlugUrl = url({
  path: '/articles/{slug:minlength(3):maxlength(50)?}',
});

const optionalProductWithoutId = OptionalProductUrl.parse('/products');
const optionalProductWithId = OptionalProductUrl.parse('/products/2.5');
const optionalProductHrefWithoutId = OptionalProductUrl.build({});
const optionalProductHrefWithId = OptionalProductUrl.build({ params: { id: 2.5 } });

const regexMinUser = RegexMinUserUrl.parse('/users/2');
const decimalPrice = DecimalPriceUrl.parse('/prices/-9.99');
const uuidUser = UuidUserUrl.parse('/users/7d444840-9dc0-11d1-b245-5ffdce74fad2');
const optionalArticleWithoutSlug = ArticleSlugUrl.parse('/articles');
const optionalArticleWithSlug = ArticleSlugUrl.parse('/articles/hello-urlkit');

export {
  ArticleSlugUrl,
  DecimalPriceUrl,
  OptionalProductUrl,
  RegexMinUserUrl,
  UuidUserUrl,
  decimalPrice,
  optionalArticleWithSlug,
  optionalArticleWithoutSlug,
  optionalProductHrefWithId,
  optionalProductHrefWithoutId,
  optionalProductWithId,
  optionalProductWithoutId,
  regexMinUser,
  uuidUser,
};
