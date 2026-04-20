import {
  isPathEscape,
  isRelativeLink,
  parseTsLink,
  resolveRelativePath,
} from '-/utils/tsLink';
import { describe, expect, test } from '@playwright/test';

describe('tsLink', () => {
  describe('isPathEscape', () => {
    test('rejects ../ traversal', () => {
      expect(isPathEscape('../foo/bar.md')).toBe(true);
    });

    test('rejects embedded ../ traversal', () => {
      expect(isPathEscape('a/../b.md')).toBe(true);
    });

    test('rejects Windows ..\\ traversal', () => {
      expect(isPathEscape('..\\foo\\bar.md')).toBe(true);
    });

    test('rejects embedded ..\\ traversal', () => {
      expect(isPathEscape('a\\..\\b.md')).toBe(true);
    });

    test('allows filename that contains ..', () => {
      expect(isPathEscape('file..md')).toBe(false);
    });

    test('allows filename with two dots not forming traversal', () => {
      expect(isPathEscape('foo/ba..r/baz.md')).toBe(false);
    });

    test('allows normal paths', () => {
      expect(isPathEscape('foo/bar.md')).toBe(false);
      expect(isPathEscape('./foo.md')).toBe(false);
    });

    test('handles null/empty input', () => {
      expect(isPathEscape(null)).toBe(false);
      expect(isPathEscape(undefined)).toBe(false);
      expect(isPathEscape('')).toBe(false);
    });
  });

  describe('isRelativeLink', () => {
    test('true for bare filename', () => {
      expect(isRelativeLink('foo.md')).toBe(true);
    });

    test('true for ./foo', () => {
      expect(isRelativeLink('./foo.md')).toBe(true);
    });

    test('true for nested relative path', () => {
      expect(isRelativeLink('sub/folder/file.md')).toBe(true);
    });

    test('false for absolute unix path', () => {
      expect(isRelativeLink('/abs/path')).toBe(false);
    });

    test('false for absolute windows path', () => {
      expect(isRelativeLink('\\abs\\path')).toBe(false);
    });

    test('false for anchor', () => {
      expect(isRelativeLink('#section')).toBe(false);
    });

    test('false for query-only', () => {
      expect(isRelativeLink('?foo=1')).toBe(false);
    });

    test('false for http(s)', () => {
      expect(isRelativeLink('http://example.com')).toBe(false);
      expect(isRelativeLink('https://example.com')).toBe(false);
    });

    test('false for ts:// protocol', () => {
      expect(isRelativeLink('ts://?tslid=abc')).toBe(false);
    });

    test('false for mailto/tel/onenote', () => {
      expect(isRelativeLink('mailto:x@y.com')).toBe(false);
      expect(isRelativeLink('tel:+1234')).toBe(false);
      expect(isRelativeLink('onenote:foo')).toBe(false);
    });

    test('false for windows drive letter', () => {
      expect(isRelativeLink('C:\\foo')).toBe(false);
    });

    test('false for empty', () => {
      expect(isRelativeLink('')).toBe(false);
    });
  });

  describe('parseTsLink', () => {
    test('classifies ts:// with tslid + tsepath as ts', () => {
      const r = parseTsLink(
        'ts://?tslid=japan-trip-demo&tsepath=itinerary%5Bplanning%20schedule%20japan%5D.md',
      );
      expect(r.kind).toBe('ts');
      expect(r.lid).toBe('japan-trip-demo');
      expect(r.ePath).toBe('itinerary[planning schedule japan].md');
      expect(r.dPath).toBeUndefined();
    });

    test('classifies ts:// with tslid + tsdpath as ts', () => {
      const r = parseTsLink(
        'ts://?tslid=japan-trip-demo&tsdpath=tasks',
      );
      expect(r.kind).toBe('ts');
      expect(r.lid).toBe('japan-trip-demo');
      expect(r.dPath).toBe('tasks');
      expect(r.ePath).toBeUndefined();
    });

    test('decodes URL-encoded path segments in tsepath', () => {
      const r = parseTsLink(
        'ts://?tslid=demo&tsepath=tasks%2FIn%20Progress%2Fbuy-jr-pass%5Binprogress%20transport%5D.md',
      );
      expect(r.ePath).toBe(
        'tasks/In Progress/buy-jr-pass[inprogress transport].md',
      );
    });

    test('captures tseid for moved-entry fallback', () => {
      const r = parseTsLink(
        'ts://?tslid=demo&tsepath=foo.md&tseid=abc-123',
      );
      expect(r.kind).toBe('ts');
      expect(r.id).toBe('abc-123');
    });

    test('classifies cmdopen as cmd', () => {
      const r = parseTsLink(
        'ts://?cmdopen=%2Fsome%2Fabsolute%2Fpath.md',
      );
      expect(r.kind).toBe('cmd');
      expect(r.cmdOpen).toBe('/some/absolute/path.md');
    });

    test('cmdopen with tslid still classifies as cmd', () => {
      const r = parseTsLink(
        'ts://?tslid=demo&cmdopen=%2Fabs%2Fpath',
      );
      expect(r.kind).toBe('cmd');
      expect(r.lid).toBe('demo');
      expect(r.cmdOpen).toBe('/abs/path');
    });

    test('classifies http(s) as external', () => {
      expect(parseTsLink('http://example.com').kind).toBe('external');
      expect(parseTsLink('https://example.com/x').kind).toBe('external');
    });

    test('classifies mailto/tel/onenote/file as external', () => {
      expect(parseTsLink('mailto:x@y.com').kind).toBe('external');
      expect(parseTsLink('tel:+1234').kind).toBe('external');
      expect(parseTsLink('onenote:foo').kind).toBe('external');
      expect(parseTsLink('file:///tmp/x').kind).toBe('external');
    });

    test('classifies bare relative path as relative', () => {
      expect(parseTsLink('foo/bar.md').kind).toBe('relative');
      expect(parseTsLink('./foo.md').kind).toBe('relative');
    });

    test('classifies current page URL as self when currentPageHref matches', () => {
      const href = 'http://localhost:3000/app/';
      const r = parseTsLink(href, href);
      expect(r.kind).toBe('self');
    });

    test('does not mark as self when currentPageHref does not match', () => {
      const r = parseTsLink('http://localhost:3000/other', 'http://localhost:3000/app/');
      expect(r.kind).toBe('external');
    });

    test('classifies absolute path as unsupported', () => {
      expect(parseTsLink('/abs/path').kind).toBe('unsupported');
    });

    test('classifies anchor as unsupported', () => {
      expect(parseTsLink('#section').kind).toBe('unsupported');
    });

    test('handles malformed URL gracefully (no throw)', () => {
      const r = parseTsLink('ts://not a valid url');
      expect(r.kind).toBeDefined();
    });

    test('strips trailing backslash from params (milkdown workaround)', () => {
      const r = parseTsLink('ts://?tslid=demo&tsepath=foo.md\\');
      expect(r.ePath).toBe('foo.md');
    });
  });

  describe('parseTsLink regression — japan-trip demo links', () => {
    const cases = [
      {
        url: 'ts://?tslid=japan-trip-demo&tsepath=tokyo%2Fday1-arrival-shibuya%5Btokyo%20day1%20sightseeing%5D.md',
        ePath: 'tokyo/day1-arrival-shibuya[tokyo day1 sightseeing].md',
      },
      {
        url: 'ts://?tslid=japan-trip-demo&tsepath=restaurants%2Fsukiyabashi-jiro%5Bsushi%20tokyo%20food%20splurge%5D.md',
        ePath: 'restaurants/sukiyabashi-jiro[sushi tokyo food splurge].md',
      },
      {
        url: 'ts://?tslid=japan-trip-demo&tsepath=tasks%2FIn%20Progress%2Freserve-hotels%5Binprogress%20booking%5D.md',
        ePath: 'tasks/In Progress/reserve-hotels[inprogress booking].md',
      },
      {
        url: 'ts://?tslid=japan-trip-demo&tsdpath=tasks',
        dPath: 'tasks',
      },
    ];

    for (const c of cases) {
      test(`parses ${c.url.slice(0, 60)}...`, () => {
        const r = parseTsLink(c.url);
        expect(r.kind).toBe('ts');
        expect(r.lid).toBe('japan-trip-demo');
        if (c.ePath) expect(r.ePath).toBe(c.ePath);
        if (c.dPath) expect(r.dPath).toBe(c.dPath);
      });
    }
  });

  describe('resolveRelativePath', () => {
    test('resolves ./file against unix base dir', () => {
      expect(resolveRelativePath('/home/user/notes', './foo.md', '/')).toBe(
        '/home/user/notes/foo.md',
      );
    });

    test('resolves bare filename against unix base dir', () => {
      expect(resolveRelativePath('/home/user/notes', 'foo.md', '/')).toBe(
        '/home/user/notes/foo.md',
      );
    });

    test('resolves nested relative path against unix base dir', () => {
      expect(
        resolveRelativePath('/home/user/notes', 'sub/a/b.md', '/'),
      ).toBe('/home/user/notes/sub/a/b.md');
    });

    test('normalizes mixed separators in relative link to target sep', () => {
      // joinPaths always prepends the separator to the first segment unless
      // the segment already starts with it — leading '\' is expected here.
      expect(
        resolveRelativePath('\\home\\user\\notes', 'sub/a/b.md', '\\'),
      ).toBe('\\home\\user\\notes\\sub\\a\\b.md');
    });

    test('strips leading ./ or .\\ from the relative link', () => {
      expect(
        resolveRelativePath('/home/user/notes', '.\\foo.md', '/'),
      ).toBe('/home/user/notes/foo.md');
    });

    test('filters out empty segments from double slashes', () => {
      expect(resolveRelativePath('/a/b', 'c//d.md', '/')).toBe('/a/b/c/d.md');
    });
  });
});
