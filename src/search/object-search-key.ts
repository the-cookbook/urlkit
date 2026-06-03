export function joinObjectSearchKey(parentKey: string, childKey: string): string {
  return `${parentKey}.${escapeObjectSearchSegment(childKey)}`;
}

export function escapeObjectSearchSegment(segment: string): string {
  return segment.replaceAll('~', '~0').replaceAll('.', '~1');
}

export function unescapeObjectSearchSegment(segment: string): string {
  let output = '';

  for (let index = 0; index < segment.length; index += 1) {
    const character = segment[index];

    if (character !== '~') {
      output += character ?? '';
      continue;
    }

    const escapeCode = segment[index + 1];

    if (escapeCode === '0') {
      output += '~';
      index += 1;
      continue;
    }

    if (escapeCode === '1') {
      output += '.';
      index += 1;
      continue;
    }

    output += character ?? '';
  }

  return output;
}

export function splitObjectSearchKey(key: string): readonly string[] {
  return Object.freeze(key.split('.').map(unescapeObjectSearchSegment));
}
