import {
  buildSearch,
  createRouteUrlContract,
  omitSearch,
  parseHash,
  parseSearch,
  patchSearch,
  pickSearch,
  replaceSearch,
} from '@cookbook/urlkit/router-runtime';

const articleRouteUrl = {
  path: '/articles/{id:int}',
  search: {
    page: { value: 'int', default: 1 },
    ref: { type: 'one', optional: true },
    tag: { type: 'many', value: 'string', optional: true },
    publishedOn: {
      type: 'date',
      format: 'dd-MM-yyyy',
      optional: true,
    },
    scheduledAt: {
      type: 'date-time',
      format: 'dd-MM-yyyy HH:mm:ss',
      optional: true,
    },
  },
  hash: ['comments', 'share'],
} as const;

const ArticleUrlRawParams = createRouteUrlContract(articleRouteUrl);
const rawState = ArticleUrlRawParams.parse('/articles/42?page=2&ref=email#comments');

// Router-runtime defaults to raw params for router compatibility.
// rawState.params.id === '42'

const ArticleUrlParsedParams = createRouteUrlContract(articleRouteUrl, { params: 'parsed' });
const parsedState = ArticleUrlParsedParams.parse('/articles/42?page=2&ref=email#comments');

// parsedState.params.id === 42

const parsedSearch = parseSearch(
  '?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=02-06-2026+12%3A30%3A05',
  {
    schema: articleRouteUrl.search,
  },
);

// parsedSearch.page === 2
// parsedSearch.ref === 'email'
// parsedSearch.tag === ['ts', 'url']
// parsedSearch.publishedOn is a Date parsed from dd-MM-yyyy
// parsedSearch.scheduledAt is a Date parsed from dd-MM-yyyy HH:mm:ss

const partiallyParsedSearch = ArticleUrlRawParams.parseSearch(
  '/articles/1?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
  {
    invalidSearch: 'omit',
  },
);

// partiallyParsedSearch extracts the search from a serialized path,
// keeps valid fields, and omits invalid optional scheduledAt.

const invalidRawState = ArticleUrlRawParams.safeParse(
  '/articles/42?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
);

// invalidRawState.success === false because strict parsing rejects invalid declared search fields.

const partialRawState = ArticleUrlRawParams.safeParse(
  '/articles/42?page=2&ref=email&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=foo',
  { invalidSearch: 'omit' },
);

// partialRawState.success === true and scheduledAt is omitted from search.

const partialHash = parseHash('#overview', articleRouteUrl.hash, { invalidHash: 'omit' });

// partialHash === undefined because #overview is not one of comments/share.

const builtSearch = buildSearch(
  {
    page: 3,
    ref: 'newsletter',
    tag: ['ts', 'url'],
    publishedOn: new Date('2026-06-02T00:00:00.000Z'),
    scheduledAt: new Date('2026-06-02T12:30:05.000Z'),
  },
  { schema: articleRouteUrl.search },
);

// builtSearch === '?page=3&ref=newsletter&tag=ts&tag=url&publishedOn=02-06-2026&scheduledAt=02-06-2026+12%3A30%3A05'

const patchedSearch = patchSearch(
  '?page=2&ref=email&tag=ts',
  { page: 4 },
  { schema: articleRouteUrl.search },
);

// patchedSearch === '?page=4&ref=email&tag=ts'

const replacedSearch = replaceSearch(
  '?page=2&ref=email&tag=ts',
  { page: 1 },
  { schema: articleRouteUrl.search },
);

// replacedSearch === '?page=1'

const omittedSearch = omitSearch('?page=2&ref=email&tag=ts', ['ref']);

// omittedSearch === '?page=2&tag=ts'

const pickedSearch = pickSearch('?page=2&ref=email&tag=ts', ['page', 'tag']);

// pickedSearch === '?page=2&tag=ts'

export {
  ArticleUrlParsedParams,
  ArticleUrlRawParams,
  articleRouteUrl,
  builtSearch,
  invalidRawState,
  omittedSearch,
  partialHash,
  partialRawState,
  partiallyParsedSearch,
  parsedSearch,
  parsedState,
  patchedSearch,
  pickedSearch,
  rawState,
  replacedSearch,
};
