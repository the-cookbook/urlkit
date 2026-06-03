export function createObjectSearchPathKey(path: readonly string[]): string {
  return JSON.stringify(path);
}

export function isObjectSearchPathEqual(
  left: readonly string[],
  right: readonly string[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}
