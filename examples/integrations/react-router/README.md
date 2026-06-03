# React Router URLKit integration

This example uses React Router data loaders.

- The product listing loader parses `request.url` with `safeParseRequest`.
- Product detail routes normalize route params with `safeNormalize`.
- UI links are built with URLKit instead of handwritten query strings.

> Local development note: the example depends on `@cookbook/urlkit` through `file:../../..`, so build the root package first when running it from this repository.

## Run

```sh
npm install
npm run dev
```
