import { int, string, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: string().default('profile'),
    page: int().default(1),
  },
});

const parsed = UserUrl.parse('/users/42?tab=settings&page=2');

// parsed.pathname === '/users/42'
// parsed.params.id === 42
// parsed.search.tab === 'settings'
// parsed.search.page === 2
// parsed.hash === undefined

const href = UserUrl.build({
  params: { id: parsed.params.id },
  search: { tab: 'settings', page: 3 },
});

// href === '/users/42?tab=settings&page=3'

const matches = UserUrl.match('/users/42?tab=settings&page=2');
const doesNotMatch = UserUrl.match('/projects/42?tab=settings&page=2');

// matches === true
// doesNotMatch === false

export { UserUrl, doesNotMatch, href, matches, parsed };
