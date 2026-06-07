---
'@cookbook/urlkit': patch
---

Fix runtime schema builder chaining so defaulted fields keep their default behavior when `.optional()` or `.required()` is called after `.default(...)`.

Defaults now act as the strongest presence rule: `schema.default(value)`, `schema.optional().default(value)`, and `schema.default(value).optional()` all normalize missing input to the configured default and infer a non-undefined parsed value.

This fixes pathless and path-based URL contracts where defaulted search fields such as `array(string()).default(['foo']).optional()` or `int().default(1).optional()` were previously treated as optional and omitted during parsing/normalization.

The release also adds regression coverage for parse, normalize, build default omission, schema-builder chaining, and the documented troubleshooting guidance for defaulted fields.
