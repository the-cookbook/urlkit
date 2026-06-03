# URLKit framework integrations

These examples show the same product catalog URL contracts integrated into different frameworks.

Each app imports the shared contracts from `../shared` and uses URLKit for:

- parsing request URLs into typed URL state
- validating requests through local middleware/pre-handler examples for Express, Hono, and Fastify
- building conditional pagination, filter, product detail, and hash-section links
- validating custom `slug` path constraints
- demonstrating repeated-key and comma-separated array formats

The examples use local mock product data so they run deterministically and do not depend on third-party API availability. Each app includes basic layout/styling so the contracts are shown in a realistic website structure rather than bare route output.

## Directories

| Directory         | Focus                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `shared`          | Product contracts, mock data, and plain HTML render helpers.                             |
| `nextjs`          | App Router pages and route handlers using `searchParams`, `params`, and `Request`.       |
| `express`         | Classic server routes using a local `createUrlKitMiddleware(contract, options)` factory. |
| `hono`            | Edge/server routes using local middleware around `c.req.raw`.                            |
| `fastify`         | Fastify pre-handlers that validate request URLs with URLKit contracts.                   |
| `react-router`    | Data loaders and `Link` hrefs built from URLKit contracts.                               |
| `remix`           | Remix loaders and server-rendered links.                                                 |
| `tanstack-router` | Route modules that keep router navigation and URL state contracts separate.              |

Run each app from its own directory after building the root package when using the local `file:../../..` dependency.
