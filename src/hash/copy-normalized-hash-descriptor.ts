import type { NormalizedHashDescriptor } from './contracts.js';

export function copyNormalizedHashDescriptor(
  descriptor: NormalizedHashDescriptor<string | undefined>,
): NormalizedHashDescriptor<string | undefined> {
  const values = descriptor.values ? Object.freeze([...descriptor.values]) : undefined;

  if (descriptor.presence === 'defaulted') {
    return Object.freeze({
      type: descriptor.type,
      presence: 'defaulted',
      ...(values ? { values } : {}),
      defaultValue: descriptor.defaultValue,
    });
  }

  return Object.freeze({
    type: descriptor.type,
    presence: descriptor.presence,
    ...(values ? { values } : {}),
  });
}
