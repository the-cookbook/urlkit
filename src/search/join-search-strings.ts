export function joinSearchStrings(...parts: readonly string[]): string {
  const body = parts
    .map((part) => part.replace(/^\?/, ''))
    .filter(Boolean)
    .join('&');

  return body ? `?${body}` : '';
}
