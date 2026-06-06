# @cookbook/urlkit API reference

This reference documents the implemented public API exposed by the package entries:

- `@cookbook/urlkit`
- `@cookbook/urlkit/static`
- `@cookbook/urlkit/router-runtime`

URLKit distinguishes **serialized URL input** from **structured URL state**:

- `parse`, `safeParse`, `parseRequest`, and `safeParseRequest` accept serialized URL input.
- `normalize` and `safeNormalize` accept structured state.
- `build` serializes structured state to a canonical URL string.
- Parsed and normalized `UrlState` always includes `pathname`, `params`, `search`, and `hash`.

## Package exports

```json
{
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
  "./static": { "types": "./dist/static.d.ts", "import": "./dist/static.js" },
  "./router-runtime": {
    "types": "./dist/router-runtime.d.ts",
    "import": "./dist/router-runtime.js"
  }
}
```

---

# Main entry: `@cookbook/urlkit`

```ts
import {
  url,
  search,
  hash,
  string,
  number,
  int,
  boolean,
  date,
  dateTime,
  array,
  enumOf,
  object,
  UrlKitError,
} from '@cookbook/urlkit';
```

## `url`

| Item        | Details                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Import path | `@cookbook/urlkit`                                                                                                         |
| Purpose     | Create a typed URL contract from runtime schema builders.                                                                  |
| Signature   | `url<const Descriptor extends RuntimeUrlDescriptor>(descriptor: Descriptor, options?: CreateUrlOptions): UrlContract<...>` |
| Throws      | `UrlKitError` with `invalid-descriptor` for invalid descriptors or invalid defaults.                                       |

### Parameters and options

| Parameter                 | Type                               | Description                                                                     |
| ------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| `descriptor.path`         | `string \| undefined`              | Optional PathKit-compatible path pattern. If omitted, the contract is pathless. |
| `descriptor.search`       | `RuntimeSearchSchema \| undefined` | Optional runtime search schema.                                                 |
| `descriptor.hash`         | `HashSchema \| undefined`          | Optional runtime hash schema.                                                   |
| `options.unknownSearch`   | `UnknownSearchBehavior`            | Contract-level default unknown search behavior.                                 |
| `options.arrayFormat`     | `'repeat' \| 'comma'`              | Contract-level default array search format for parsing and building.            |
| `options.pathConstraints` | `PathConstraintMap`                | Per-contract custom PathKit constraints, registered before path compilation.    |

Standalone `url(...)` path params default to parsed mode. `int`, `decimal` and `range` path params parse to numbers. PathKit does not expose a `{param:number}` built-in; use `{param:decimal}` for finite decimal path values.

```ts
import { enumOf, int, string, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: enumOf(['profile', 'settings']).default('profile'),
    page: int().default(1),
    ref: string().optional(),
  },
  hash: enumOf(['activity', 'comments']).optional(),
});

const state = UserUrl.parse('/users/42?page=2#activity');
// state.params.id is number
```

## Custom path constraints

URLKit re-exports PathKit's `createConstraint` and provides global helpers for app-level constraint setup.

```ts
import { createConstraint, registerPathConstraint, url } from '@cookbook/urlkit';

const slug = createConstraint({
  parse(paramName, value) {
    if (!/^[a-z0-9-]+$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a slug.`);
    }
  },
  verify(_paramName, params) {
    if (params.trim()) {
      throw new Error('Slug constraint does not accept arguments.');
    }
  },
  toRegExp() {
    return '[a-z0-9-]+';
  },
});

registerPathConstraint('slug', slug);

const ArticleUrl = url({
  path: '/articles/{slug:slug}',
});
```

Per-contract constraints are also supported on `url(...)`, `compileStaticUrl(...)`, and `createRouteUrlContract(...)`:

```ts
const ArticleUrl = url({ path: '/articles/{slug:slug}' }, { pathConstraints: { slug } });
```

Duplicate global registration with the same constraint instance is allowed. Registering a different constraint under an existing name throws unless `{ overwrite: true }` is passed to `registerPathConstraint` or `registerPathConstraints`.

Custom constraints infer `string` route params by default. Built-in `int`, `decimal` and `range` constraints continue to infer `number`. If a PathKit constraint rejects a value, URLKit reports `invalid-param` and preserves the original PathKit validation error in `UrlKitError.cause`.

## `search`

| Item        | Details                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import path | `@cookbook/urlkit`                                                                                                                                                                  |
| Purpose     | Thin pathless wrapper over `url({ search })`.                                                                                                                                       |
| Signature   | `search<const Schema extends RuntimeSearchSchema>(schema: Schema, options?: CreateUrlOptions): UrlContract<'pathless', string, EmptyParams, InferRuntimeSearch<Schema>, undefined>` |
| Throws      | `UrlKitError` with `invalid-descriptor` for invalid schemas/defaults.                                                                                                               |

```ts
import { int, search, string } from '@cookbook/urlkit';

const ProductSearch = search({
  category: string().optional(),
  page: int().default(1),
});

ProductSearch.build({ search: { page: 2 } });
// '?page=2'

ProductSearch.build({ pathname: '/products', search: { page: 2 } });
// '/products?page=2'
```

## `hash`

| Item        | Details                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import path | `@cookbook/urlkit`                                                                                                                                                              |
| Purpose     | Thin pathless wrapper over `url({ hash })`.                                                                                                                                     |
| Signature   | `hash<const Schema extends HashSchema>(schema: Schema, options?: CreateUrlOptions): UrlContract<'pathless', string, EmptyParams, EmptyParams, InferRuntimeSchemaValue<Schema>>` |
| Throws      | `UrlKitError` with `invalid-descriptor` for invalid schemas/defaults.                                                                                                           |

```ts
import { enumOf, hash } from '@cookbook/urlkit';

const DocsHash = hash(enumOf(['intro', 'api']).optional());

DocsHash.build({ hash: 'api' });
// '#api'

DocsHash.build({ pathname: '/docs', hash: 'api' });
// '/docs#api'
```

---

# Runtime schema builders

All runtime schema builders support:

```ts
schema.optional();
schema.required();
schema.default(value);
```

Defaults are validated when the schema is compiled by a URL/search/hash contract. `null` is treated as absent for optional/defaulted fields and invalid for required fields.

| Builder          | Purpose                                                      | Serialized behavior                              | Default validation             |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------ | ------------------------------ |
| `string()`       | String values                                                | Exact string                                     | default must be string         |
| `number()`       | Finite numbers                                               | decimal string                                   | default must be finite number  |
| `int()`          | Finite integers                                              | integer string                                   | default must be finite integer |
| `boolean()`      | Strict booleans                                              | `true` / `false`                                 | default must be boolean        |
| `date()`         | Date, date-time, Unix, custom string, or custom codec values | selected built-in, format-string, or codec value | default must be valid `Date`   |
| `dateTime()`     | Strict UTC, custom string, or custom codec date-time values  | strict UTC, format-string, or codec value        | default must be valid `Date`   |
| `enumOf(values)` | Exact literal enum                                           | exact string value                               | default must be in `values`    |
| `array(schema)`  | Repeated search values or object arrays                      | repeated keys by default                         | default must be array          |
| `object(shape)`  | Declared object search fields                                | dotted keys                                      | default must match shape       |

## `boolean()` strict parsing

Only serialized `true` and `false` are valid. Values such as `1`, `0`, `yes`, `no`, `on`, and `off` are rejected.

```ts
const schema = boolean().default(false);
```

## `enumOf`

| Item                 | Details                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| Signature            | `enumOf<const Values extends readonly [string, ...string[]]>(values: Values)`         |
| TypeScript inference | Infers `Values[number]`.                                                              |
| Throws               | `invalid-descriptor` for invalid defaults; validation errors use the calling context. |

```ts
const sort = enumOf(['newest', 'popular']).default('newest');
```

## `array`

Arrays serialize as repeated search keys by default.

```ts
const schema = array(string()).default([]);
```

## `object`

Object search fields hydrate declared dotted keys only. Raw search parsing without a schema remains flat.

```ts
const TableUrl = url({
  search: {
    filter: object({
      role: string().optional(),
      active: boolean().optional(),
      'user.name': string().optional(),
    }),
  },
});

TableUrl.build({
  search: {
    filter: {
      role: 'admin',
      active: true,
      'user.name': 'Ada',
    },
  },
});
// '?filter.role=admin&filter.active=true&filter.user%7E1name=Ada'
```

Object segment escaping happens before URL encoding:

| Character in segment | Escaped form |
| -------------------- | ------------ |
| `~`                  | `~0`         |
| `.`                  | `~1`         |

If two serialized keys resolve to the same object path after unescaping, parsing throws `UrlKitError` with `invalid-search`. Repeated object keys are allowed only for declared `array(...)` fields.

---

# Date builders

## `date`

| Item         | Details                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Import path  | `@cookbook/urlkit`                                                                                                        |
| Signatures   | `date()`, `date({ format: 'date' \| 'date-time' \| 'unix-seconds' \| 'unix-ms' \| DateFormatString \| DateFormatCodec })` |
| Return value | Runtime schema builder that infers `Date`.                                                                                |
| Throws       | Invalid parse/serialize values use the validation context error code; invalid defaults throw `invalid-descriptor`.        |

Supported formats:

| Format         | Serialized value            | Notes                                                     |
| -------------- | --------------------------- | --------------------------------------------------------- |
| `date`         | `YYYY-MM-DD`                | UTC date-only. Rejects invalid calendar dates.            |
| `date-time`    | `YYYY-MM-DDTHH:mm:ss.sssZ`  | Strict UTC only. Offset or ambiguous values are rejected. |
| `unix-seconds` | finite integer seconds      | Parses to `Date`; serializes from `Date`.                 |
| `unix-ms`      | finite integer milliseconds | Parses to `Date`; serializes from `Date`.                 |
| format string  | token-defined string        | Runtime only; supports URLKit's strict token subset.      |
| custom codec   | codec-defined string        | Runtime only; not supported in static descriptors.        |

```ts
const ReportsUrl = url({
  search: {
    day: date(),
    displayDay: date({ format: 'dd-MM-yyyy' }).optional(),
    at: date({ format: 'date-time' }).optional(),
    created: date({ format: 'unix-seconds' }).optional(),
  },
});
```

## `dateTime`

| Item             | Details                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Signatures       | `dateTime()`, `dateTime({ format: 'date-time' \| DateFormatString \| DateFormatCodec })`                           |
| Purpose          | Convenience builder for strict UTC date-time values, custom format strings, or custom codecs.                      |
| Serialized value | `YYYY-MM-DDTHH:mm:ss.sssZ` by default, or a format-string/codec-defined string.                                    |
| Throws           | Invalid parse/serialize values use the validation context error code; invalid defaults throw `invalid-descriptor`. |

```ts
const schema = dateTime().optional();
```

`dateTime(...)` accepts custom runtime date-time format strings and custom runtime codecs. It does not accept other built-in `date(...)` formats such as `'date'`, `'unix-seconds'`, or `'unix-ms'`.

```ts
const EuropeanDateTime = dateTime({
  format: 'dd-MM-yyyy HH:mm:ss',
});
```

## Custom runtime date format strings

Runtime format strings use URLKit's strict token subset:

| Token  | Meaning                     |
| ------ | --------------------------- |
| `yyyy` | Four-digit UTC year         |
| `MM`   | Two-digit UTC month         |
| `dd`   | Two-digit UTC day           |
| `HH`   | Two-digit UTC hour          |
| `mm`   | Two-digit UTC minute        |
| `ss`   | Two-digit UTC second        |
| `SSS`  | Three-digit UTC millisecond |

Rules:

- `date({ format })` requires `yyyy`, `MM`, and `dd` and does not allow time tokens.
- `dateTime({ format })` requires `yyyy`, `MM`, `dd`, `HH`, `mm`, and `ss`; `SSS` is optional.
- Literal letters must be single-quoted, for example `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`.
- Unsupported or ambiguous tokens such as `YY`, `YYYY`, `M`, `D`, `DD`, `h`, `a`, timezone names, and locale month names are rejected.
- Parsing is strict and validates real UTC calendar dates/instants.
- If a date-time format omits `SSS`, serializing a `Date` with non-zero milliseconds throws to avoid silent precision loss.

```ts
const ReportsUrl = url({
  search: {
    from: date({ format: 'dd-MM-yyyy' }),
    at: dateTime({ format: 'dd-MM-yyyy HH:mm:ss' }).optional(),
    preciseAt: dateTime({ format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" }).optional(),
  },
});
```

## Custom runtime date codecs

```ts
const ReportsUrl = url({
  search: {
    from: date({
      format: {
        parse(value) {
          const [day, month, year] = value.split('-');
          return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        },
        serialize(value) {
          const day = String(value.getUTCDate()).padStart(2, '0');
          const month = String(value.getUTCMonth() + 1).padStart(2, '0');
          return `${day}-${month}-${value.getUTCFullYear()}`;
        },
      },
    }),
  },
});
```

The custom `parse` method must return a valid `Date`. The custom `serialize` method must return a non-empty string. Runtime custom codecs are supported by both `date({ format: codec })` and `dateTime({ format: codec })`.

---

# `UrlContract`

```ts
interface UrlContract<Mode, Pathname, Params, Search, Hash> {
  readonly pattern: Mode extends 'path' ? string : undefined;
  parse(input: string | URL, options?: ParseUrlOptions): UrlState<Pathname, Params, Search, Hash>;
  safeParse(input: string | URL, options?: ParseUrlOptions): UrlSafeParseResult<Pathname, Params, Search, Hash>;
  parseRequest(input: Request | UrlRequestInput, options?: ParseRequestOptions): UrlState<Pathname, Params, Search, Hash>;
  safeParseRequest(input: Request | UrlRequestInput, options?: ParseRequestOptions): UrlSafeParseResult<Pathname, Params, Search, Hash>;
  normalize(input, options?: NormalizeUrlOptions): UrlState<...>;
  safeNormalize(input, options?: NormalizeUrlOptions): UrlSafeNormalizeResult<...>;
  build(input, options?: BuildUrlOptions): string;
  match(input: string | URL, options?: ParseUrlOptions): boolean;
  readonly parsePathname: Mode extends 'path' ? (pathname: string) => Params : never;
  readonly buildPath: Mode extends 'path' ? PathBuildMethod<Params> : never;
  parseSearch(input: string | URLSearchParams, options?: ParseUrlOptions): Search;
  buildSearch(search: Partial<Search>, options?: BuildSearchOptions): string;
  parseHash(input: unknown): Hash;
  buildHash(hash?: Hash, options?: BuildUrlOptions): string;
  withSearch(input: string | URL, search: Partial<Search>, options?: PatchSearchOptions): string;
  replaceSearch(input: string | URL, search: Partial<Search>, options?: BuildSearchOptions): string;
  omitSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;
  pickSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;
}
```

## `pattern`

- Path mode: the original path pattern string.
- Pathless mode: `undefined`.

## `parse`

| Item       | Details                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------- | --------------------------------- |
| Purpose    | Parse serialized URL input and return typed URL state.                                         |
| Parameters | `input: string                                                                                 | URL`, `options?: ParseUrlOptions` |
| Returns    | `UrlState<Pathname, Params, Search, Hash>`                                                     |
| Throws     | `UrlKitError` for invalid URL, path mismatch, invalid params, invalid search, or invalid hash. |

```ts
const state = UserUrl.parse('/users/42?page=2#activity');
```

## `safeParse`

Returns a discriminated result and does not throw for ordinary validation errors.

```ts
const result = UserUrl.safeParse('/users/not-a-number');

if (!result.success) {
  result.error.code;
}
```

## `parseRequest` and `safeParseRequest`

| Item       | Details                                                                                |
| ---------- | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Purpose    | Parse web-standard `Request` or request-like `{ url: string }`.                        |
| Parameters | `input: Request                                                                        | UrlRequestInput`, `options?: ParseRequestOptions` |
| Options    | `baseUrl` for relative request-like URLs; `unknownSearch` and `arrayFormat` overrides. |
| Throws     | `parseRequest` throws `UrlKitError`; `safeParseRequest` returns safe failure.          |

```ts
UserUrl.parseRequest(new Request('https://example.com/users/42'));

UserUrl.safeParseRequest({ url: '/users/42?page=2' }, { baseUrl: 'https://example.com' });
```

## `normalize` and `safeNormalize`

| Item                 | Details                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| Purpose              | Validate structured URL state and apply defaults.                            |
| Path mode input      | `params`, optional `search`, optional `hash`; no caller-provided `pathname`. |
| Pathless input       | optional `pathname`, optional `search`, optional `hash`; no `params`.        |
| TypeScript inference | Pathless literal pathname is preserved.                                      |
| Throws               | `normalize` throws `UrlKitError`; `safeNormalize` returns safe failure.      |

```ts
UserUrl.normalize({
  params: { id: 42 },
  search: { page: 2 },
});
```

## `build`

| Item     | Details                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Purpose  | Serialize typed state to a canonical URL string.                                                          |
| Options  | `BuildUrlOptions` with `defaults?: 'include' \| 'omit'` and `arrayFormat?: 'repeat' \| 'comma'`.          |
| Behavior | Path-based contracts build pathname from `params`; pathless contracts return suffixes without `pathname`. |

```ts
UserUrl.build({ params: { id: 42 }, search: { page: 2 } });
// '/users/42?page=2'

ProductSearch.build({ search: { page: 2 } });
// '?page=2'
```

## `match`

Returns `true` when the input satisfies the contract and `false` for ordinary validation failures.

```ts
UserUrl.match('/users/42'); // true
UserUrl.match('/users/nope'); // false
```

## Path helpers: `parsePathname` and `buildPath`

Available only for path-mode contracts by type. Pathless contracts expose these properties as `never`.

```ts
UserUrl.parsePathname('/users/42');
// { id: 42 }

UserUrl.buildPath({ id: 42 });
// '/users/42'
```

## Search helpers

| Method                                   | Purpose                                                          | Notes                                                    |
| ---------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `parseSearch(input, options?)`           | Parse search params through the contract schema.                 | Returns typed `Search`. Unknowns follow `unknownSearch`. |
| `buildSearch(search, options?)`          | Build a search suffix from typed partial search.                 | Returns `''` or `'?...'`.                                |
| `withSearch(input, search, options?)`    | Patch a URL while preserving existing unknown params by default. | Keeps path/hash.                                         |
| `replaceSearch(input, search, options?)` | Replace URL search with new typed search.                        | Removes unknown params.                                  |
| `omitSearch(input, keys, options?)`      | Remove selected search keys.                                     | Keeps path/hash.                                         |
| `pickSearch(input, keys, options?)`      | Keep selected search keys.                                       | Keeps path/hash.                                         |

```ts
UserUrl.withSearch('/users/42?page=1#activity', { page: 2 });
// '/users/42?page=2#activity'
```

## Hash helpers

| Method                       | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `parseHash(input)`           | Parse hash through the contract hash schema.                 |
| `buildHash(hash?, options?)` | Build a hash suffix and apply default include/omit behavior. |

```ts
UserUrl.parseHash('#activity');
UserUrl.buildHash('comments');
```

---

# Public contracts and options

## `UrlMode`

```ts
type UrlMode = 'path' | 'pathless';
```

## `UrlState`

```ts
interface UrlState<Pathname, Params, Search, Hash> {
  readonly pathname: Pathname;
  readonly params: Params;
  readonly search: Search;
  readonly hash: Hash;
  readonly unknownSearch?: UnknownSearchParams;
}
```

## `UnknownSearchParams`

```ts
interface UnknownSearchParams {
  readonly [key: string]: string | readonly string[];
}
```

Preserved unknown search params live here and do not pollute typed `search`.

## `UnknownSearchBehavior`

```ts
type UnknownSearchBehavior = 'strip' | 'preserve' | 'error';
```

| Value      | Behavior                                        |
| ---------- | ----------------------------------------------- |
| `strip`    | Remove unknown params. Default.                 |
| `preserve` | Return unknown params in `state.unknownSearch`. |
| `error`    | Throw `UrlKitError` with `invalid-search`.      |

## Options

```ts
type SearchArrayFormat = 'repeat' | 'comma';

interface PathConstraintMap {
  readonly [name: string]: ConstraintValidation;
}

interface RegisterPathConstraintOptions {
  readonly overwrite?: boolean;
}

interface ParseUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
}

interface NormalizeUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
}

interface BuildUrlOptions {
  readonly defaults?: 'include' | 'omit';
  readonly arrayFormat?: SearchArrayFormat;
}

interface BuildSearchOptions extends BuildUrlOptions {
  readonly sortKeys?: boolean;
}

interface PatchSearchOptions extends BuildSearchOptions {
  readonly removeUndefined?: boolean;
  readonly removeNull?: boolean;
}

interface ParseRequestOptions extends ParseUrlOptions {
  readonly baseUrl?: string;
}
```

## Build defaults

| Option              | Behavior                                  |
| ------------------- | ----------------------------------------- |
| omitted / `include` | Serialize defaulted search/hash values.   |
| `omit`              | Omit values equal to normalized defaults. |

## Safe result contracts

```ts
interface UrlSafeParseSuccess<Pathname, Params, Search, Hash> {
  readonly success: true;
  readonly data: UrlState<Pathname, Params, Search, Hash>;
}

interface UrlSafeParseFailure {
  readonly success: false;
  readonly error: UrlKitError;
}

type UrlSafeParseResult<Pathname, Params, Search, Hash> =
  | UrlSafeParseSuccess<Pathname, Params, Search, Hash>
  | UrlSafeParseFailure;
```

`UrlSafeNormalizeResult` has the same failure shape and a success `data` value typed from the normalized state.

## `UrlKitError` and `UrlKitErrorCode`

| Item        | Details                                     |
| ----------- | ------------------------------------------- |
| Import path | `@cookbook/urlkit`                          |
| Signature   | `new UrlKitError(code, message?, options?)` |
| Properties  | `code`, optional `path`, optional `cause`   |

Error codes:

| Code                 | Typical meaning                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `invalid-url`        | Input is not a valid serialized URL/request URL.                                             |
| `path-mismatch`      | Pathname does not satisfy the path pattern.                                                  |
| `missing-param`      | Required path param missing during build.                                                    |
| `invalid-param`      | Path param cannot parse or build; PathKit constraint failures are available through `cause`. |
| `missing-search`     | Required search field missing.                                                               |
| `invalid-search`     | Search field invalid, unknown disallowed, or object collision.                               |
| `invalid-hash`       | Hash missing or invalid.                                                                     |
| `invalid-descriptor` | Contract/schema/static descriptor invalid at construction time.                              |

```ts
try {
  UserUrl.parse('/users/not-a-number');
} catch (error) {
  if (error instanceof UrlKitError) {
    error.code;
    error.path;
  }
}
```

## Advanced exported contracts

The main entry also exports contracts used by advanced users and tooling:

- `EmptyParams`
- `UrlRequestInput`
- `UrlBuildInput`
- `UrlNormalizeInput`
- `NormalizeUrlState`
- `PathBuildMethod`
- `RuntimeSchemaBuilder`
- `RuntimeSchemaSafeResult`
- `InferRuntimeSchemaValue`
- `RuntimeSearchSchema`
- `RuntimeSearchField`
- `InferRuntimeSearch`
- `HashSchema`
- `NormalizedHashDescriptor`
- `DateFormatCodec`
- `DateTimeFormat`
- `DateTimeOptions`
- `DateTimeSchema`
- URL inference helpers such as `PathnameFromPattern` and `ParamsFromPattern`

These are exported because they are part of the public type surface. Most application code only needs `url`, `search`, `hash`, schema builders, `UrlState`, options, safe result types, and `UrlKitError`.

---

# Static entry: `@cookbook/urlkit/static`

```ts
import { compileStaticUrl, compileStaticSearch, compileStaticHash } from '@cookbook/urlkit/static';
```

Static descriptors are plain data and are suitable for router tooling and static analysis. Do not use runtime builders in static descriptors.

## `compileStaticUrl`

| Item      | Details                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signature | `compileStaticUrl<Descriptor extends StaticUrlDescriptor>(descriptor: Descriptor, options?: CompileStaticUrlOptions): NormalizedUrlDescriptor<...>` |
| Purpose   | Compile a static URL descriptor into URLKit's normalized internal descriptor.                                                                       |
| Throws    | `UrlKitError` with `invalid-descriptor` for invalid descriptors/defaults.                                                                           |

```ts
const compiled = compileStaticUrl({
  path: '/search',
  search: {
    q: 'string',
    page: { value: 'int', default: 1 },
  },
  hash: ['results', 'filters'],
} as const);
```

## `compileStaticSearch`

| Item      | Details                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------ |
| Signature | `compileStaticSearch(descriptor: StaticSearchDescriptor): RuntimeSearchSchema`                   |
| Purpose   | Convert static search descriptors to runtime search schema representation and validate defaults. |
| Throws    | `invalid-descriptor` for invalid fields/defaults.                                                |

Static search field forms:

```ts
const search = {
  q: 'string',
  page: { value: 'int', default: 1 },
  tags: { type: 'many', optional: true },
  sort: {
    value: { type: 'enum', values: ['newest', 'popular'] },
    default: 'newest',
  },
  startsAt: { value: 'date-time', optional: true },
} as const;
```

Supported static values:

- `string`
- `number`
- `int`
- `boolean`
- `date`
- `date-time`
- `unix-seconds`
- `unix-ms`
- `{ type: 'date', format: ... }`
- `{ type: 'enum', values: [...] }`

Static date defaults must be serialized values, not `Date` instances.

## `compileStaticHash`

| Item      | Details                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Signature | `compileStaticHash<Descriptor extends StaticHashDescriptor>(descriptor: Descriptor): NormalizedHashDescriptor<InferStaticHash<Descriptor>>` |
| Purpose   | Compile static hash descriptors.                                                                                                            |
| Throws    | `invalid-descriptor` for invalid descriptors/defaults.                                                                                      |

Static hash forms:

```ts
const optionalEnum = ['comments', 'share'] as const;
const stringHash = { type: 'string', optional: true } as const;
const enumHash = { type: 'enum', values: ['overview', 'comments'], default: 'overview' } as const;
```

## Static descriptor contracts

```ts
interface StaticUrlDescriptor {
  readonly path?: string;
  readonly search?: StaticSearchDescriptor;
  readonly hash?: StaticHashDescriptor;
}

interface StaticSearchDescriptor {
  readonly [key: string]: StaticSearchField;
}

type StaticHashDescriptor =
  | readonly string[]
  | StaticStringHashDescriptor
  | StaticEnumHashDescriptor;
```

Exported static inference helpers include:

- `InferStaticSearch`
- `InferStaticHash`
- `StaticUrlModeFromDescriptor`
- `InferStaticUrlSearch`
- `InferStaticUrlHash`

---

# Router-runtime entry: `@cookbook/urlkit/router-runtime`

```ts
import {
  createRouteUrlContract,
  parseSearch,
  buildSearch,
  patchSearch,
  replaceSearch,
  omitSearch,
  pickSearch,
  parseHash,
  buildHash,
  normalizeHash,
} from '@cookbook/urlkit/router-runtime';
```

Router-runtime APIs are low-level primitives for router packages. They are framework-agnostic and do not define routes, route IDs, components, loaders, middleware, route trees, or adapters.

## `createRouteUrlContract`

| Item                | Details                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signature           | `createRouteUrlContract<Descriptor, Options>(descriptor, options?: CreateRouteUrlContractOptions): UrlContract<...>`                               |
| Purpose             | Create a URL contract from a static route-compatible descriptor.                                                                                   |
| Options             | `params?: 'raw' \| 'parsed'`, `unknownSearch?: UnknownSearchBehavior`, `arrayFormat?: 'repeat' \| 'comma'`, `pathConstraints?: PathConstraintMap`. |
| Default params mode | `raw`                                                                                                                                              |
| Throws              | `invalid-descriptor` for invalid static descriptors.                                                                                               |

```ts
const ArticleUrl = createRouteUrlContract({
  path: '/articles/{slug:regex([a-z0-9-]+)}',
  search: {
    ref: { type: 'one', optional: true },
    page: { value: 'int', default: 1 },
  },
  hash: ['comments', 'share'],
} as const);

const state = ArticleUrl.parse('/articles/post-1?ref=email#comments');
// state.params.slug is string because router-runtime defaults to raw params.
```

Use parsed params when desired:

```ts
const UserUrl = createRouteUrlContract({ path: '/users/{id:int}' } as const, { params: 'parsed' });

UserUrl.parse('/users/42').params.id;
// number
```

## Router-runtime `parseSearch`

| Item                  | Details                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Signature with schema | `parseSearch(input, { schema, unknownSearch?, arrayFormat? }): InferStaticSearch<typeof schema>` |
| Fallback signature    | `parseSearch(input, options?): RawSearchParams`                                                  |
| Purpose               | Parse raw or static-schema search. `arrayFormat: 'comma'` splits declared array fields.          |
| Throws                | `invalid-search` / `missing-search` for schema validation failures.                              |

```ts
parseSearch('?page=2', {
  schema: {
    page: { value: 'int', default: 1 },
  },
});
// { page: 2 }

parseSearch('?tags=ts%2Crouter', {
  schema: {
    tags: { type: 'many', optional: true },
  },
  arrayFormat: 'comma',
});
// { tags: ['ts', 'router'] }

parseSearch('?filter.role=admin');
// { 'filter.role': 'admin' }
```

## Router-runtime search builders

| Function                                 | Purpose                                                   | Schema support          |
| ---------------------------------------- | --------------------------------------------------------- | ----------------------- |
| `buildSearch(input?, options?)`          | Build a search suffix.                                    | Optional static schema. |
| `patchSearch(current, patch, options?)`  | Merge search values; preserves unknown params by default. | Optional static schema. |
| `replaceSearch(current, next, options?)` | Replace search values; removes unknown params.            | Optional static schema. |
| `omitSearch(current, keys)`              | Remove selected raw keys.                                 | Raw helper.             |
| `pickSearch(current, keys)`              | Keep selected raw keys.                                   | Raw helper.             |

```ts
const schema = {
  page: { value: 'int', default: 1 },
  q: { value: 'string', optional: true },
  tags: { type: 'many', optional: true },
} as const;

buildSearch({ page: 2, tags: ['ts', 'router'] }, { schema, arrayFormat: 'comma' });
// '?page=2&tags=ts%2Crouter'

patchSearch('?page=1&debug=true', { page: 2 }, { schema });
// '?page=2&debug=true'

replaceSearch('?page=1&debug=true', { page: 2 }, { schema });
// '?page=2'
```

## Router-runtime hash helpers

These delegate to the same hash implementation used by contracts.

| Function        | Signature                                          | Purpose                          |
| --------------- | -------------------------------------------------- | -------------------------------- |
| `parseHash`     | `parseHash(input, descriptor?)`                    | Parse a hash fragment.           |
| `buildHash`     | `buildHash(hash?, descriptorOrOptions?, options?)` | Build a hash fragment.           |
| `normalizeHash` | `normalizeHash(input, descriptor?)`                | Normalize structured hash input. |

```ts
parseHash('#comments', ['comments', 'share'] as const);
buildHash('comments', ['comments', 'share'] as const);
normalizeHash('comments', ['comments', 'share'] as const);
```
