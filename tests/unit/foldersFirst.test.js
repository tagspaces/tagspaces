import { describe, expect, test } from '@playwright/test';
import { sortByCriteria } from '@tagspaces/tagspaces-common/misc';
import { foldersFirst } from '../../src/renderer/perspectives/grid/hooks/foldersFirst';

const folder = (name, size, lmdt) => ({
  name,
  isFile: false,
  size,
  lmdt,
  extension: '',
  tags: [],
});
const file = (name, size, lmdt, extension, tags = []) => ({
  name,
  isFile: true,
  size,
  lmdt,
  extension,
  tags,
});

const entries = [
  file('b.txt', 30, 300, 'txt', [{ title: 'z' }]),
  folder('dirB', 0, 500),
  file('a.pdf', 10, 100, 'pdf'),
  folder('dirA', 0, 50),
  file('c.jpg', 20, 200, 'jpg', [{ title: 'y' }]),
];

const names = (list) => list.map((entry) => entry.name);

describe('foldersFirst', () => {
  for (const criteria of [
    'byName',
    'byFileSize',
    'byDateModified',
    'byExtension',
    'byFirstTag',
    'random',
  ]) {
    for (const asc of [true, false]) {
      test(`folders lead for ${criteria} ${asc ? 'asc' : 'desc'}`, () => {
        const sorted = foldersFirst(sortByCriteria(entries, criteria, asc));
        expect(sorted).toHaveLength(entries.length);
        expect(sorted.slice(0, 2).every((entry) => !entry.isFile)).toBe(true);
        expect(sorted.slice(2).every((entry) => entry.isFile)).toBe(true);
      });
    }
  }

  test('keeps the sort order within folders and within files', () => {
    expect(names(foldersFirst(sortByCriteria(entries, 'byName', false)))).toEqual(
      ['dirB', 'dirA', 'c.jpg', 'b.txt', 'a.pdf'],
    );
    expect(
      names(foldersFirst(sortByCriteria(entries, 'byFileSize', false))),
    ).toEqual(['dirB', 'dirA', 'b.txt', 'c.jpg', 'a.pdf']);
    expect(
      names(foldersFirst(sortByCriteria(entries, 'byDateModified', true))),
    ).toEqual(['dirA', 'dirB', 'a.pdf', 'c.jpg', 'b.txt']);
  });

  test('keeps the input order within groups and does not mutate the input', () => {
    const input = [...entries];
    expect(names(foldersFirst(input))).toEqual([
      'dirB',
      'dirA',
      'b.txt',
      'a.pdf',
      'c.jpg',
    ]);
    expect(input).toEqual(entries);
  });
});
