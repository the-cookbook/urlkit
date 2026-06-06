---
'@cookbook/urlkit': patch
---

Preserve PathKit constraint validation details when path params fail validation.

URLKit now wraps PathKit constraint failures as `UrlKitError` instances with code `invalid-param` while preserving the original constraint error as `cause`. The generated error message also includes the underlying constraint failure message when available.

This makes path validation failures easier to debug without changing URLKit's public error shape.
