import { int, url } from '@cookbook/urlkit';

const UserRequestUrl = url({
  path: '/users/{id:int}',
  search: {
    page: int().default(1),
  },
});

const requestState = UserRequestUrl.parseRequest(
  new Request('https://example.com/users/42?page=2'),
);

// requestState.params.id === 42
// requestState.search.page === 2

const requestLikeState = UserRequestUrl.parseRequest(
  { url: '/users/42?page=3' },
  { baseUrl: 'https://example.com' },
);

// requestLikeState.params.id === 42
// requestLikeState.search.page === 3

const safeRequest = UserRequestUrl.safeParseRequest(
  { url: '/users/not-a-number?page=3' },
  { baseUrl: 'https://example.com' },
);

// safeRequest.success === false
// No Express, Hono, Fastify, or framework-specific request type is required.

export { UserRequestUrl, requestLikeState, requestState, safeRequest };
