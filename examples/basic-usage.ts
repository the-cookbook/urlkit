import { int, string, url, enumOf } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: string().default('profile'),
    page: int(),
  },
  hash: enumOf(['show']).default('show'),
});

const parsed = UserUrl.parse('/users/42?tab=settings&page=2#show');

// parsed.pathname === '/users/42'
// parsed.params.id === 42
// parsed.search.tab === 'settings'
// parsed.search.page === 2
// parsed.hash === 'show'

const href = UserUrl.build({
  params: { id: parsed.params.id },
  search: { tab: 'settings', page: 3 },
});

// href === '/users/42?tab=settings&page=3#show'

const matches = UserUrl.match('/users/42?tab=settings&page=2');
const doesNotMatch = UserUrl.match('/projects/42?tab=settings&page=2#open');

const ApiUrl = url({ path: '/api' }, { pathMatch: { end: false } });

const apiPrefix = ApiUrl.parse('/api/users').pathname;

const FilesUrl = url({ path: '/files/{*path}' });
const fileSegments = FilesUrl.parse('/files/docs/readme', { wildcardFormat: 'array' }).params.path;

// matches === true
// doesNotMatch === false

export { UserUrl, apiPrefix, doesNotMatch, fileSegments, href, matches, parsed };
