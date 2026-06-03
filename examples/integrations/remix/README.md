# Remix URLKit integration

This example uses Remix loaders to parse and validate product catalog URLs.

- `app/routes/products._index.tsx` parses the request URL into typed filters.
- `app/routes/products.$slug.tsx` normalizes route params and builds section hash links.
- The example consumes URLKit through the repository build output via `../shared/urlkit.ts`, mirroring how a published app consumes `@cookbook/urlkit`.

## Run

```sh
pnpm install
pnpm dev
```

The `predev` and `prebuild` scripts build the root URLKit package first.

## Remix + Vite

This example uses Remix's Vite dev server:

```json
{
  "dev": "remix vite:dev",
  "build": "remix vite:build"
}
```

Using `remix dev` runs Remix's classic compiler path and bypasses the Vite aliases in `vite.config.ts`. That causes Remix to bundle URLKit source files directly instead of the built package output.

## pnpm package resolution

This example is pnpm-only. It declares its own React, Remix, URLKit, and PathKit dependencies and uses Vite aliases to resolve the local shared example files and the built URLKit package output.

After pulling changes to this example, reinstall its dependencies so pnpm updates Remix, React, Vite, and `isbot` from this `package.json`:

```sh
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

If your machine still reports Yarn Plug'n'Play errors, remove any stale `.pnp.cjs` file from an ancestor directory outside this example. The repository does not use Yarn PnP configuration.
