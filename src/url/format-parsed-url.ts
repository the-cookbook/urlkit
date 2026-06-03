import type { ParsedUrlInput } from './parse-url.js';

export function formatParsedUrl(input: ParsedUrlInput, search: string): string {
  return `${input.pathname}${search}${input.hash}`;
}
