import {
  UrlKitError,
  buildSearch,
  createRouteUrlContract,
  omitSearch,
  parseHash,
  parseSearch,
  patchSearch,
  pickSearch,
  replaceSearch,
  type RouteUrlContract,
  type StaticUrlDescriptor,
} from '@cookbook/urlkit/router-runtime';

export const articleRouteUrlDescriptor = {
  path: '/articles/{id:int}',
  search: {
    category: { type: 'string' },
    page: { type: 'int', default: 1 },
    ref: { type: 'string', optional: true },
    tag: { type: 'string', many: true, optional: true },
    sort: {
      type: 'enum',
      values: ['newest', 'popular'],
      default: 'newest',
    },
    featured: {
      type: 'boolean',
      optional: true,
    },
    score: {
      type: 'number',
      optional: true,
    },
    publishedOn: {
      type: 'date',
      format: 'dd-MM-yyyy',
      optional: true,
    },
    scheduledAt: {
      type: 'date-time',
      format: "dd-MM-yyyy'T'HH:mm:ss'Z'",
      optional: true,
    },
  },
  hash: {
    type: 'enum',
    values: ['comments', 'share'],
    optional: true,
  },
} as const satisfies StaticUrlDescriptor;

export const ArticleUrlRawParams: RouteUrlContract<typeof articleRouteUrlDescriptor> =
  createRouteUrlContract(articleRouteUrlDescriptor);

export const ArticleUrlParsedParams = createRouteUrlContract(articleRouteUrlDescriptor, {
  params: 'parsed',
});

// Static date-time format strings parse and serialize UTC fields.
// Use toISOString() or UTC getters when asserting parsed Date values.

export const rawState = ArticleUrlRawParams.parse(
  '/articles/42?category=engineering&page=2&ref=email&tag=ts&tag=url&sort=popular&featured=true&score=9.5&publishedOn=02-06-2026&scheduledAt=02-06-2026T12%3A30%3A05Z#comments',
);

export const parsedState = ArticleUrlParsedParams.parse(
  '/articles/42?category=engineering&page=2&ref=email#comments',
);

export const parsedArticleUrl = ArticleUrlParsedParams.parse(
  '/articles/42?category=engineering&page=2&ref=newsletter&tag=ts&tag=urlkit&sort=popular&featured=true&score=9.5&publishedOn=06-06-2026&scheduledAt=06-06-2026T10%3A30%3A00Z#comments',
);

export const safeParsedArticleUrl = ArticleUrlParsedParams.safeParse(
  '/articles/42?category=engineering&page=2#comments',
);

export const articleRequest = new Request(
  'https://example.com/articles/42?category=engineering&page=2&tag=ts#comments',
);

export const parsedArticleRequest = ArticleUrlParsedParams.parseRequest(articleRequest);
export const safeParsedArticleRequest = ArticleUrlParsedParams.safeParseRequest(articleRequest);

export const normalizedArticleUrl = ArticleUrlParsedParams.normalize({
  params: { id: 42 },
  search: {
    category: 'engineering',
    page: 2,
    ref: 'newsletter',
    tag: ['ts', 'urlkit'],
    sort: 'popular',
    featured: true,
    score: 9.5,
    publishedOn: new Date('2026-06-06T00:00:00.000Z'),
    scheduledAt: new Date('2026-06-06T10:30:00.000Z'),
  },
  hash: 'comments',
});

export const safeNormalizedArticleUrl = ArticleUrlParsedParams.safeNormalize({
  params: { id: 42 },
  search: {
    category: 'engineering',
    page: 2,
    sort: 'popular',
  },
  hash: 'share',
});

export const builtArticleUrl = ArticleUrlParsedParams.build({
  params: { id: 42 },
  search: {
    category: 'engineering',
    page: 2,
    ref: 'newsletter',
    tag: ['ts', 'urlkit'],
    sort: 'popular',
    featured: true,
    score: 9.5,
    publishedOn: new Date('2026-06-06T00:00:00.000Z'),
    scheduledAt: new Date('2026-06-06T10:30:00.000Z'),
  },
  hash: 'comments',
});

export const articleUrlMatches = ArticleUrlParsedParams.match(
  '/articles/42?category=engineering&page=2#comments',
);

export const parsedSearch = parseSearch(
  '?category=engineering&page=2&ref=email&tag=ts&tag=url&sort=popular&featured=true&score=9.5&publishedOn=02-06-2026&scheduledAt=02-06-2026T12%3A30%3A05Z',
  {
    schema: articleRouteUrlDescriptor.search,
  },
);

export const partiallyParsedSearch = ArticleUrlParsedParams.parseSearch(
  '/articles/1?category=engineering&page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
  {
    invalidSearch: 'omit',
  },
);

export const invalidRawState = ArticleUrlParsedParams.safeParse(
  '/articles/42?category=engineering&page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
);

export const partialRawState = ArticleUrlParsedParams.safeParse(
  '/articles/42?category=engineering&page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
  { invalidSearch: 'omit' },
);

export const partialHash = parseHash('#overview', articleRouteUrlDescriptor.hash, {
  invalidHash: 'omit',
});

export const builtSearch = buildSearch(
  {
    category: 'engineering',
    page: 3,
    ref: 'newsletter',
    tag: ['ts', 'url'],
    sort: 'popular',
    featured: true,
    score: 9.5,
    publishedOn: new Date('2026-06-02T00:00:00.000Z'),
    scheduledAt: new Date('2026-06-02T12:30:05.000Z'),
  },
  { schema: articleRouteUrlDescriptor.search },
);

export const patchedSearch = patchSearch(
  '?category=engineering&page=2&ref=email&tag=ts',
  { page: 4 },
  { schema: articleRouteUrlDescriptor.search },
);

export const replacedSearch = replaceSearch(
  '?category=engineering&page=2&ref=email&tag=ts',
  { category: 'engineering', page: 1 },
  { schema: articleRouteUrlDescriptor.search },
);

export const omittedSearch = omitSearch('?category=engineering&page=2&ref=email&tag=ts', ['ref']);

export const pickedSearch = pickSearch('?category=engineering&page=2&ref=email&tag=ts', [
  'page',
  'tag',
]);

export const strippedUnknownSearch = ArticleUrlParsedParams.parse(
  '/articles/42?category=engineering&page=2&utm_source=ignored#comments',
  { unknownSearch: 'strip' },
);

export const preservedUnknownSearch = ArticleUrlParsedParams.parse(
  '/articles/42?category=engineering&page=2&utm_source=kept#comments',
  { unknownSearch: 'preserve' },
);

export const unknownSearchError = ArticleUrlParsedParams.safeParse(
  '/articles/42?category=engineering&page=2&utm_source=error#comments',
  { unknownSearch: 'error' },
);

export const listingUrlDescriptor = {
  search: {
    page: { type: 'int', default: 1 },
    tag: { type: 'string', many: true, optional: true },
  },
  hash: {
    type: 'string',
    optional: true,
  },
} as const satisfies StaticUrlDescriptor;

export const ListingUrl = createRouteUrlContract(listingUrlDescriptor);

export const listingSuffix = ListingUrl.build({
  search: {
    page: 2,
    tag: ['typescript', 'urlkit'],
  },
  hash: 'results',
});

export const listingPath = ListingUrl.build({
  pathname: '/articles',
  search: {
    page: 2,
    tag: ['typescript', 'urlkit'],
  },
  hash: 'results',
});

export const defaultedHashUrlDescriptor = {
  path: '/docs/{slug}',
  hash: {
    type: 'enum',
    values: ['overview', 'api'],
    default: 'overview',
  },
} as const satisfies StaticUrlDescriptor;

export const DefaultedHashUrl = createRouteUrlContract(defaultedHashUrlDescriptor);
export const defaultedHashState = DefaultedHashUrl.parse('/docs/intro');
export const defaultedHashHref = DefaultedHashUrl.build({ params: { slug: 'intro' } });

export const brokenArticleUrls = {
  pathMismatch: ArticleUrlParsedParams.safeParse('/authors/42?category=engineering&page=2'),
  invalidParam: ArticleUrlParsedParams.safeParse(
    '/articles/not-an-int?category=engineering&page=2',
  ),
  missingRequiredSearch: ArticleUrlParsedParams.safeParse('/articles/42?page=2#comments'),
  invalidIntSearch: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=abc#comments',
  ),
  invalidEnumSearch: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=2&sort=oldest',
  ),
  invalidBooleanSearch: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=2&featured=yes',
  ),
  invalidDateSearch: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=2&publishedOn=2026-06-06',
  ),
  invalidDateTimeSearch: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=2&scheduledAt=2026-06-06T10:30:00.000Z',
  ),
  invalidHash: ArticleUrlParsedParams.safeParse('/articles/42?category=engineering&page=2#invalid'),
  unknownSearchRejected: ArticleUrlParsedParams.safeParse(
    '/articles/42?category=engineering&page=2&utm_source=blocked',
    { unknownSearch: 'error' },
  ),
};

export const brokenArticleStates = {
  missingParam: ArticleUrlParsedParams.safeNormalize({
    params: {} as never,
    search: { category: 'engineering', page: 2 },
    hash: 'comments',
  }),
  invalidParam: ArticleUrlParsedParams.safeNormalize({
    params: { id: Number.NaN },
    search: { category: 'engineering', page: 2 },
    hash: 'comments',
  }),
  invalidSearch: ArticleUrlParsedParams.safeNormalize({
    params: { id: 42 },
    search: { category: 'engineering', page: Number.NaN },
    hash: 'comments',
  }),
  invalidHash: ArticleUrlParsedParams.safeNormalize({
    params: { id: 42 },
    search: { category: 'engineering', page: 2 },
    hash: 'invalid' as never,
  }),
};

function captureUrlKitError(operation: () => unknown): UrlKitError | undefined {
  try {
    operation();
    return undefined;
  } catch (error) {
    return error instanceof UrlKitError ? error : undefined;
  }
}

export const brokenStaticDescriptors = {
  invalidValueField: captureUrlKitError(() =>
    createRouteUrlContract({
      path: '/legacy',
      search: {
        created: { value: 'date', optional: true },
      },
    } as unknown as StaticUrlDescriptor),
  ),
  legacyManyField: captureUrlKitError(() =>
    createRouteUrlContract({
      path: '/legacy',
      search: {
        tag: { type: 'many', value: 'string' },
      },
    } as unknown as StaticUrlDescriptor),
  ),
  legacyHashArray: captureUrlKitError(() =>
    createRouteUrlContract({
      path: '/legacy',
      hash: ['comments', 'share'],
    } as unknown as StaticUrlDescriptor),
  ),
  optionalWithDefault: captureUrlKitError(() =>
    createRouteUrlContract({
      path: '/legacy',
      search: {
        page: { type: 'int', optional: true, default: 1 },
      },
    } as unknown as StaticUrlDescriptor),
  ),
  falseFlags: captureUrlKitError(() =>
    createRouteUrlContract({
      path: '/legacy',
      search: {
        tag: { type: 'string', many: false },
      },
    } as unknown as StaticUrlDescriptor),
  ),
};
