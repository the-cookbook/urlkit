import { UrlKitError, int, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    page: int().default(1),
  },
});

try {
  UserUrl.parse('/users/not-a-number');
} catch (error) {
  if (error instanceof UrlKitError) {
    // error.code === 'invalid-param'
    // error.path is deterministic and useful for diagnostics.
  }
}

const parsed = UserUrl.safeParse('/users/not-a-number');

if (!parsed.success) {
  // parsed.error is a UrlKitError.
  switch (parsed.error.code) {
    case 'invalid-param':
      // Show a path-param specific message.
      break;
    case 'path-mismatch':
      // Show a not-found or wrong-resource message.
      break;
    default:
      // Handle other UrlKitErrorCode values.
      break;
  }
}

const normalized = UserUrl.safeNormalize({
  params: { id: 'not-a-number' as never },
});

// normalized.success === false
// safeParse, safeNormalize, and safeParseRequest return safe result objects for ordinary validation failures.

const withDefaults = UserUrl.parse('/users/42');

// parse applies defaults.
// withDefaults.search.page === 1

const normalizedDefaults = UserUrl.normalize({ params: { id: 42 } });

// normalize applies defaults.
// normalizedDefaults.search.page === 1

const explicitDefault = UserUrl.build({ params: { id: 42 }, search: { page: 1 } });
const omittedDefault = UserUrl.build(
  { params: { id: 42 }, search: { page: 1 } },
  { defaults: 'omit' },
);

// build serializes what it receives by default.
// explicitDefault === '/users/42?page=1'
// omittedDefault === '/users/42'

export {
  UserUrl,
  explicitDefault,
  normalized,
  normalizedDefaults,
  omittedDefault,
  parsed,
  withDefaults,
};
