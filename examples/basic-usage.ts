import { int, string, url, enumOf } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: string().default('profile'),
    page: int(),
  },
  hash: enumOf(['show']),
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
  hash: 'show',
});

// href === '/users/42?tab=settings&page=3#show'

const matches = UserUrl.match('/users/42?tab=settings&page=2#show');
const doesNotMatch = UserUrl.match('/projects/42?tab=settings&page=2#open');

// matches === true
// doesNotMatch === false

export { UserUrl, doesNotMatch, href, matches, parsed };
