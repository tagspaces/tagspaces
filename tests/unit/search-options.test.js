import { describe, expect, test } from '@playwright/test';
import { findAction } from '-/components/SearchOptions';

describe('findAction', () => {
  test('matches value-taking keywords by prefix', () => {
    expect(findAction('t:image')).toBe('type:');
    expect(findAction('type:image')).toBe('type:');
    expect(findAction('+work')).toBe('+');
    expect(findAction('-draft')).toBe('-');
    expect(findAction('|client')).toBe('|');
    expect(findAction('l:')).toBe('locations');
  });

  test('matches command short forms by prefix', () => {
    expect(findAction('h:')).toBe('history');
    expect(findAction('f:')).toBe('filter');
    expect(findAction('b:')).toBe('bookmarks');
    expect(findAction('q:')).toBe('search-queries');
    expect(findAction('s:')).toBe('search-history');
  });

  test('treats bare command words as plain search text', () => {
    expect(findAction('history')).toBeUndefined();
    expect(findAction('filter')).toBeUndefined();
    expect(findAction('locations')).toBeUndefined();
    expect(findAction('bookmarks')).toBeUndefined();
    expect(findAction('search-queries')).toBeUndefined();
    expect(findAction('search-history')).toBeUndefined();
  });

  test('still resolves existing chip values in exact mode', () => {
    expect(findAction('locations', true)).toBe('locations');
    expect(findAction('history', true)).toBe('history');
  });

  test('does not hijack search terms starting with a command word', () => {
    expect(findAction('history-report')).toBeUndefined();
    expect(findAction('filtered')).toBeUndefined();
    expect(findAction('locationsmap')).toBeUndefined();
    expect(findAction('bookmarks2024')).toBeUndefined();
    expect(findAction('search-queries.txt')).toBeUndefined();
    expect(findAction('invoice')).toBeUndefined();
  });
});
