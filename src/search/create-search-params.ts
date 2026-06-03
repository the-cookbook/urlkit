export function createSearchParams(input: string | URLSearchParams): URLSearchParams {
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }

  return new URLSearchParams(input.startsWith('?') ? input.slice(1) : input);
}
