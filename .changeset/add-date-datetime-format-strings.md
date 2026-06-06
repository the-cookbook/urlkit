---
'@cookbook/urlkit': minor
---

Add strict custom date and date-time format strings to runtime schema builders.

`date({ format: 'dd-MM-yyyy' })` now parses and serializes custom date-only strings using URLKit's supported token subset, while `dateTime({ format: 'dd-MM-yyyy HH:mm:ss' })` supports custom date-time strings. Supported tokens are `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, and `SSS`; parsing is strict and validates real UTC calendar dates and instants.

Existing built-in date formats and explicit `{ parse, serialize }` runtime codecs remain supported. Static descriptors continue to use built-in serialized date formats only.
