import { describe, expect, it } from 'vitest';
import { compileStaticUrl } from '../static/compile-static-url.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { omitCompiledUrlSearch, pickCompiledUrlSearch } from './filter-compiled-url-search.js';

describe('omitCompiledUrlSearch', () => {
  it('omits selected raw keys and preserves repeated values, path, and hash', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(
      omitCompiledUrlSearch('/search?q=router&tag=ts&tag=url&debug=true#top', ['debug'], compiled),
    ).toBe('/search?q=router&tag=ts&tag=url#top');
  });

  it('supports deterministic sorted output', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(omitCompiledUrlSearch('/search?z=last&a=first', [], compiled, { sortKeys: true })).toBe(
      '/search?a=first&z=last',
    );
  });
});

describe('pickCompiledUrlSearch', () => {
  it('keeps selected raw keys and preserves repeated values, path, and hash', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(
      pickCompiledUrlSearch('/search?q=router&tag=ts&tag=url&debug=true#top', ['tag'], compiled),
    ).toBe('/search?tag=ts&tag=url#top');
  });

  it('returns a path and hash when no keys match', () => {
    const compiled = compileUrlDescriptor(compileStaticUrl({ path: '/search' }));

    expect(pickCompiledUrlSearch('/search?q=router#top', ['missing'], compiled)).toBe(
      '/search#top',
    );
  });
});
