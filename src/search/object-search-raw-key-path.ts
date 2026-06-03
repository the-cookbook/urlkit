import { splitObjectSearchKey } from './object-search-key.js';

export function getObjectSearchRawKeyPath(
  parentKey: string,
  rawKey: string,
): readonly string[] | undefined {
  const prefix = `${parentKey}.`;

  if (!rawKey.startsWith(prefix)) {
    return undefined;
  }

  const childKey = rawKey.slice(prefix.length);

  if (!childKey) {
    return undefined;
  }

  return splitObjectSearchKey(childKey);
}
