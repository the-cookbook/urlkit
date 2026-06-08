# Troubleshooting

## My path param inferred as `number`

`min(...)` and `max(...)` are numeric value constraints, so URLKit infers `number` when they appear anywhere in a path constraint chain:

```ts
url({ path: '/products/{id:min(1):max(10)}' });
// id: number
```

For string length validation, use `minlength(...)` and `maxlength(...)`:

```ts
url({ path: '/articles/{slug:minlength(3):maxlength(50)}' });
// slug: string
```

## My optional path param still requires `params`

Optional path params should not force a build input to include `params`:

```ts
const ProductUrl = url({ path: '/products/{id:min(1)?}' });

ProductUrl.build({});
// '/products'

ProductUrl.build({ params: { id: 2 } });
// '/products/2'
```

Required path params still require `params`:

```ts
const ProductUrl = url({ path: '/products/{id:min(1)}' });

ProductUrl.build({ params: { id: 2 } });
// '/products/2'
```
