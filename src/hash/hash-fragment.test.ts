import { describe, expect, it } from 'vitest';
import { readHashFragment, writeHashFragment } from './hash-fragment.js';

describe('hash fragment helpers', () => {
  it('reads hash fragments', () => {
    expect(readHashFragment('#comments')).toBe('comments');
    expect(readHashFragment('#hello%20world')).toBe('hello world');
    expect(readHashFragment('')).toBeUndefined();
  });

  it('writes hash fragments', () => {
    expect(writeHashFragment('comments')).toBe('#comments');
    expect(writeHashFragment('hello world')).toBe('#hello%20world');
  });
});
