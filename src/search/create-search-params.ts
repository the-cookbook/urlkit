export function createSearchParams(input: string | URLSearchParams): URLSearchParams {
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input);
  }

  return new URLSearchParams(extractSearchInput(input));
}

function extractSearchInput(input: string): string {
  if (input.startsWith('?')) {
    return input.slice(1);
  }

  const searchStart = input.indexOf('?');

  if (searchStart === -1) {
    return input;
  }

  const hashStart = input.indexOf('#', searchStart + 1);

  return input.slice(searchStart + 1, hashStart === -1 ? undefined : hashStart);
}
