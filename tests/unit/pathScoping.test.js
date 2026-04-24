import { describe, expect, test } from '@playwright/test';

import {
  isPathWithinRoot,
  normalizePathForCompare,
  relativePathFromRoot,
} from '-/utils/pathScoping';

describe('normalizePathForCompare', () => {
  test('strips leading and trailing forward slashes', () => {
    expect(normalizePathForCompare('/demo/')).toBe('demo');
    expect(normalizePathForCompare('demo/')).toBe('demo');
    expect(normalizePathForCompare('/demo')).toBe('demo');
    expect(normalizePathForCompare('demo')).toBe('demo');
  });

  test('normalizes backslashes to forward slashes', () => {
    expect(normalizePathForCompare('C:\\Users\\me')).toBe('C:/Users/me');
    expect(normalizePathForCompare('\\\\share\\folder\\')).toBe(
      '/share/folder',
    );
  });

  test('handles empty / null / undefined', () => {
    expect(normalizePathForCompare('')).toBe('');
    expect(normalizePathForCompare(null)).toBe('');
    expect(normalizePathForCompare(undefined)).toBe('');
  });
});

describe('isPathWithinRoot', () => {
  test('bucket-root S3 (empty rootPath) accepts any item', () => {
    expect(isPathWithinRoot('file.txt', '')).toBe(true);
    expect(isPathWithinRoot('/file.txt', '')).toBe(true);
    expect(isPathWithinRoot('sub/file.txt', '')).toBe(true);
    expect(isPathWithinRoot('/sub/file.txt', null)).toBe(true);
    expect(isPathWithinRoot('anything', undefined)).toBe(true);
  });

  test('S3 with path prefix — leading slash on item, trailing slash on root', () => {
    // This is the concrete case that bit the perspective filters.
    expect(isPathWithinRoot('/demo/Bookmarks', 'demo/')).toBe(true);
    expect(isPathWithinRoot('/demo/sub/file.txt', 'demo/')).toBe(true);
    expect(isPathWithinRoot('/demo', 'demo/')).toBe(true);
    expect(isPathWithinRoot('/other/x', 'demo/')).toBe(false);
  });

  test('enforces separator boundary — "foo" does not match "foobar"', () => {
    expect(isPathWithinRoot('demofoo/x', 'demo')).toBe(false);
    expect(isPathWithinRoot('demofoo', 'demo')).toBe(false);
    expect(isPathWithinRoot('demo/foo', 'demo')).toBe(true);
    expect(isPathWithinRoot('demo', 'demo')).toBe(true);
  });

  test('POSIX absolute paths (Mac / Linux)', () => {
    expect(isPathWithinRoot('/Users/me/docs/file.txt', '/Users/me')).toBe(true);
    expect(isPathWithinRoot('/Users/me', '/Users/me')).toBe(true);
    expect(isPathWithinRoot('/Users/foo/docs', '/Users/me')).toBe(false);
  });

  test('Windows absolute paths (backslash separators)', () => {
    expect(
      isPathWithinRoot('C:\\Users\\me\\docs\\file.txt', 'C:\\Users\\me'),
    ).toBe(true);
    // Mixed separators after enhance/persist should still match
    expect(
      isPathWithinRoot('C:/Users/me/docs/file.txt', 'C:\\Users\\me'),
    ).toBe(true);
    expect(
      isPathWithinRoot('C:\\Users\\foo\\docs', 'C:\\Users\\me'),
    ).toBe(false);
  });

  test('subfolder scoping — root narrower than location', () => {
    // Viewing `demo/sub` — only items under that subfolder pass.
    expect(isPathWithinRoot('/demo/sub/file.txt', 'demo/sub')).toBe(true);
    expect(isPathWithinRoot('/demo/sub', 'demo/sub')).toBe(true);
    expect(isPathWithinRoot('/demo/other/file.txt', 'demo/sub')).toBe(false);
    expect(isPathWithinRoot('/demo/file.txt', 'demo/sub')).toBe(false);
  });
});

describe('relativePathFromRoot', () => {
  test('returns normalized item as-is when root is empty', () => {
    expect(relativePathFromRoot('/file.txt', '')).toBe('file.txt');
    expect(relativePathFromRoot('sub/file.txt', null)).toBe('sub/file.txt');
  });

  test('strips root prefix including the separator', () => {
    expect(relativePathFromRoot('/demo/Bookmarks', 'demo/')).toBe('Bookmarks');
    expect(relativePathFromRoot('/demo/sub/file.txt', 'demo/')).toBe(
      'sub/file.txt',
    );
  });

  test('returns empty string when item equals root', () => {
    expect(relativePathFromRoot('/demo', 'demo/')).toBe('');
    expect(relativePathFromRoot('demo', 'demo')).toBe('');
  });

  test('returns normalized item unchanged when not within root', () => {
    // Best-effort — callers should pre-check with isPathWithinRoot.
    expect(relativePathFromRoot('/other/x', 'demo/')).toBe('other/x');
  });

  test('Windows paths', () => {
    expect(
      relativePathFromRoot(
        'C:\\Users\\me\\docs\\file.txt',
        'C:\\Users\\me',
      ),
    ).toBe('docs/file.txt');
  });
});
