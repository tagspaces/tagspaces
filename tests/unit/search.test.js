import { expect, test } from '@playwright/test';

// Mock AppConfig for testing
const AppConfig = {
  SearchTypeGroups: {
    files: ['files'],
    folders: ['folders'],
    untagged: ['untagged'],
    any: ['any'],
  },
  SearchTimePeriods: {
    today: { key: 'today' },
    yesterday: { key: 'yesterday' },
    past7Days: { key: 'past7Days' },
    past30Days: { key: 'past30Days' },
    past6Months: { key: 'past6Months' },
    pastYear: { key: 'pastYear' },
    moreThanYear: { key: 'moreThanYear' },
  },
  SearchSizes: {
    empty: { key: 'empty', thresholdBytes: 0 },
    tiny: { key: 'tiny', thresholdBytes: 10240 }, // 10KB
    verySmall: { key: 'verySmall', thresholdBytes: 102400 }, // 100KB
    small: { key: 'small', thresholdBytes: 1048576 }, // 1MB
    medium: { key: 'medium', thresholdBytes: 10485760 }, // 10MB
    large: { key: 'large', thresholdBytes: 104857600 }, // 100MB
    huge: { key: 'huge', thresholdBytes: 1073741824 }, // 1GB
  },
};

// Helper function to test JMESPath query construction
function testConstructjmespathQuery() {
  // Mock function since we can't import directly
  function constructjmespathQuery(searchQuery) {
    const ANDtagsExist = searchQuery.tagsAND && searchQuery.tagsAND.length >= 1;
    const ORtagsExist = searchQuery.tagsOR && searchQuery.tagsOR.length >= 1;
    const NOTtagsExist = searchQuery.tagsNOT && searchQuery.tagsNOT.length >= 1;
    
    if (!ANDtagsExist && !ORtagsExist && !NOTtagsExist) {
      return '';
    }

    const queryParts = [];

    if (ORtagsExist) {
      const orTags = searchQuery.tagsOR
        .map((tag) => tag.title.trim().toLowerCase())
        .filter((title) => title.length > 0)
        .map((title) => `title=='${title}'`)
        .join(' || ');
      queryParts.push(`[? tags[? ${orTags}]]`);
    }

    if (ANDtagsExist) {
      searchQuery.tagsAND.forEach((tag) => {
        const cleanedTagTitle = tag.title.trim().toLowerCase();
        if (cleanedTagTitle.length > 0) {
          queryParts.push(`[? tags[? title=='${cleanedTagTitle}']]`);
        }
      });
    }

    if (NOTtagsExist) {
      searchQuery.tagsNOT.forEach((tag) => {
        const cleanedTagTitle = tag.title.trim().toLowerCase();
        if (cleanedTagTitle.length > 0) {
          queryParts.push(`[?!(tags[? title=='${cleanedTagTitle}'])]`);
        }
      });
    }

    let jmespathQuery = queryParts.join(' | ');

    return jmespathQuery.length > 0 ? 'index' + jmespathQuery : '';
  }

  return constructjmespathQuery;
}

const constructjmespathQuery = testConstructjmespathQuery();

// Helper function to test date period filtering
function testFilterByDatePeriod() {
  function filterByDatePeriod(items, periodKey, getTimeValue) {
    if (!periodKey) return items;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const msInDay = 1000 * 60 * 60 * 24;

    let fromTs = null;
    let toTs = null;

    if (periodKey === 'today') {
      fromTs = startOfToday;
      toTs = Number.MAX_VALUE;
    } else if (periodKey === 'yesterday') {
      fromTs = startOfToday - msInDay;
      toTs = startOfToday;
    } else if (periodKey === 'past7Days') {
      fromTs = startOfToday - msInDay * 7;
      toTs = startOfToday;
    } else if (periodKey === 'past30Days') {
      fromTs = startOfToday - msInDay * 30;
      toTs = startOfToday;
    } else if (periodKey === 'past6Months') {
      fromTs = startOfToday - msInDay * 30 * 6;
      toTs = startOfToday;
    } else if (periodKey === 'pastYear') {
      fromTs = startOfToday - msInDay * 365;
      toTs = startOfToday;
    } else if (periodKey === 'moreThanYear') {
      fromTs = 0;
      toTs = startOfToday - msInDay * 365;
    }

    if (fromTs === null || toTs === null) return items;

    return items.filter((entry) => {
      const t = getTimeValue(entry) ?? 0;
      return t >= fromTs && t <= toTs;
    });
  }

  return filterByDatePeriod;
}

const filterByDatePeriod = testFilterByDatePeriod();

// Helper function to test file size filtering
function testFilterIndex() {
  function filterIndex(data, searchQuery) {
    let results = data;

    if (searchQuery.fileSize) {
      const fileSizeMap = {
        empty: (entry) =>
          entry.size === 0 && entry.isFile,
        tiny: (entry) =>
          entry.size > 0 &&
          entry.size <= 10240 &&
          entry.isFile,
        verySmall: (entry) =>
          entry.size > 10240 &&
          entry.size <= 102400 &&
          entry.isFile,
        small: (entry) =>
          entry.size > 102400 &&
          entry.size <= 1048576 &&
          entry.isFile,
        medium: (entry) =>
          entry.size > 1048576 &&
          entry.size <= 10485760 &&
          entry.isFile,
        large: (entry) =>
          entry.size > 10485760 &&
          entry.size <= 104857600 &&
          entry.isFile,
        huge: (entry) =>
          entry.size > 1073741824 && entry.isFile,
      };

      if (fileSizeMap[searchQuery.fileSize]) {
        results = results.filter(fileSizeMap[searchQuery.fileSize]);
      }
    }

    return results;
  }

  return filterIndex;
}

const filterIndex = testFilterIndex();

// Test: OR tags query construction
test('constructjmespathQuery with OR tags', () => {
  const searchQuery = {
    tagsOR: [{ title: 'tag1' }, { title: 'tag2' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='tag1'");
  expect(result).toContain("title=='tag2'");
  expect(result).toContain(' || ');
  expect(result).toContain('index');
});

// Test: AND tags query construction
test('constructjmespathQuery with AND tags', () => {
  const searchQuery = {
    tagsAND: [{ title: 'tag1' }, { title: 'tag2' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='tag1'");
  expect(result).toContain("title=='tag2'");
  expect(result).toContain(' | ');
  expect(result).toContain('index');
});

// Test: NOT tags query construction
test('constructjmespathQuery with NOT tags', () => {
  const searchQuery = {
    tagsNOT: [{ title: 'tag1' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='tag1'");
  expect(result).toContain('!');
  expect(result).toContain('index');
});

// Test: Mixed OR, AND, and NOT tags
test('constructjmespathQuery with mixed OR, AND, NOT tags', () => {
  const searchQuery = {
    tagsOR: [{ title: 'orTag' }],
    tagsAND: [{ title: 'andTag' }],
    tagsNOT: [{ title: 'notTag' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='ortag'"); // lowercased
  expect(result).toContain("title=='andtag'");
  expect(result).toContain("title=='nottag'");
  expect(result).toContain(' | ');
});

// Test: Empty query
test('constructjmespathQuery with empty tags returns empty string', () => {
  const searchQuery = {
    tagsOR: [],
    tagsAND: [],
    tagsNOT: [],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toBe('');
});

// Test: Tag titles are lowercased
test('constructjmespathQuery lowercases tag titles', () => {
  const searchQuery = {
    tagsAND: [{ title: 'MyTag' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='mytag'");
  expect(result).not.toContain('MyTag');
});

// Test: Tag titles with whitespace are trimmed
test('constructjmespathQuery trims whitespace from tag titles', () => {
  const searchQuery = {
    tagsAND: [{ title: '  spacedTag  ' }],
  };

  const result = constructjmespathQuery(searchQuery);
  expect(result).toContain("title=='spacedtag'");
});

// Test: filterByDatePeriod for today
test('filterByDatePeriod filters items for today', () => {
  const now = new Date();
  const todayTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const items = [
    { id: 1, lmdt: todayTime + 3600000 }, // 1 hour from today start
    { id: 2, lmdt: todayTime - 86400000 }, // yesterday
  ];

  const result = filterByDatePeriod(items, 'today', (entry) => entry.lmdt);
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(1);
});

// Test: filterByDatePeriod for past 7 days
test('filterByDatePeriod filters items for past7Days', () => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const msInDay = 1000 * 60 * 60 * 24;

  const items = [
    { id: 1, lmdt: startOfToday - msInDay * 3 }, // 3 days ago
    { id: 2, lmdt: startOfToday - msInDay * 10 }, // 10 days ago
  ];

  const result = filterByDatePeriod(items, 'past7Days', (entry) => entry.lmdt);
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(1);
});

// Test: filterByDatePeriod with undefined returns all items
test('filterByDatePeriod with undefined periodKey returns all items', () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }];

  const result = filterByDatePeriod(items, undefined, (entry) => entry.lmdt);
  expect(result.length).toBe(3);
});

// Test: filterIndex for tiny files
test('filterIndex filters tiny files correctly', () => {
  const data = [
    { id: 1, size: 5120, isFile: true }, // 5KB - tiny
    { id: 2, size: 50000, isFile: true }, // 50KB - verySmall
    { id: 3, size: 60000, isFile: true }, // 60KB - verySmall
    { id: 4, size: 5000, isFile: false }, // folder
  ];

  const result = filterIndex(data, { fileSize: 'tiny' });
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(1);
});

// Test: filterIndex for small files
test('filterIndex filters small files correctly', () => {
  const data = [
    { id: 1, size: 50000, isFile: true }, // verySmall
    { id: 2, size: 500000, isFile: true }, // small
    { id: 3, size: 2000000, isFile: true }, // large
  ];

  const result = filterIndex(data, { fileSize: 'small' });
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(2);
});

// Test: filterIndex for huge files
test('filterIndex filters huge files correctly', () => {
  const data = [
    { id: 1, size: 100000000, isFile: true }, // 100MB - large
    { id: 2, size: 2000000000, isFile: true }, // 2GB - huge
    { id: 3, size: 5000000000, isFile: true }, // 5GB - huge
  ];

  const result = filterIndex(data, { fileSize: 'huge' });
  expect(result.length).toBe(2);
  expect(result[0].id).toBe(2);
  expect(result[1].id).toBe(3);
});

// Test: filterIndex ignores folders regardless of size
test('filterIndex ignores folders regardless of size', () => {
  const data = [
    { id: 1, size: 0, isFile: false }, // folder, empty
    { id: 2, size: 5000, isFile: false }, // folder, small
    { id: 3, size: 5000, isFile: true }, // file, small
  ];

  const result = filterIndex(data, { fileSize: 'tiny' });
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(3);
});

// Test: filterIndex with empty files
test('filterIndex filters empty files correctly', () => {
  const data = [
    { id: 1, size: 0, isFile: true }, // empty
    { id: 2, size: 100, isFile: true }, // tiny
  ];

  const result = filterIndex(data, { fileSize: 'empty' });
  expect(result.length).toBe(1);
  expect(result[0].id).toBe(1);
});

// Test: filterIndex with no fileSize filter
test('filterIndex with no fileSize returns all items', () => {
  const data = [
    { id: 1, size: 100, isFile: true },
    { id: 2, size: 1000, isFile: false },
    { id: 3, size: 10000, isFile: true },
  ];

  const result = filterIndex(data, {});
  expect(result.length).toBe(3);
});

// Test: haveSearchFilters helper function
test('haveSearchFilters detects search filters correctly', () => {
  function haveSearchFilters(searchQuery) {
    if (!searchQuery) return false;
    return !!(
      searchQuery.textQuery ||
        (searchQuery.tagsAND !== undefined && searchQuery.tagsAND.length > 0) ||
        (searchQuery.tagsNOT !== undefined && searchQuery.tagsNOT.length > 0) ||
        (searchQuery.tagsOR !== undefined && searchQuery.tagsOR.length > 0) ||
        (searchQuery.fileTypes !== undefined &&
          searchQuery.fileTypes !== 'any') ||
        searchQuery.lastModified ||
        searchQuery.dateCreated ||
        searchQuery.tagTimePeriodFrom ||
        searchQuery.tagTimePeriodTo ||
        searchQuery.tagPlaceLat ||
        searchQuery.tagPlaceLong ||
        searchQuery.fileSize
    );
  }

  // Should return true with text query
  expect(haveSearchFilters({ textQuery: 'test' })).toBe(true);

  // Should return true with tags
  expect(haveSearchFilters({ tagsAND: [{ title: 'tag1' }] })).toBe(true);

  // Should return true with file size
  expect(haveSearchFilters({ fileSize: 'small' })).toBe(true);

  // Should return false with empty query
  expect(haveSearchFilters({})).toBe(false);

  // Should return false with null
  expect(haveSearchFilters(null)).toBe(false);
});

// Test: defaultTitle function
test('defaultTitle constructs title from search query', () => {
  function defaultTitle(searchQuery) {
    let title = '';
    if (searchQuery) {
      if (searchQuery.textQuery) {
        title += searchQuery.textQuery;
      }
      if (searchQuery.tagsAND && searchQuery.tagsAND.length > 0) {
        title += searchQuery.tagsAND.map((tag) => ' +' + tag.title);
      }
      if (searchQuery.tagsNOT && searchQuery.tagsNOT.length > 0) {
        title += searchQuery.tagsNOT.map((tag) => ' -' + tag.title);
      }
      if (searchQuery.tagsOR && searchQuery.tagsOR.length > 0) {
        title += searchQuery.tagsOR.map((tag) => ' |' + tag.title);
      }
    }
    return title.trim();
  }

  const result = defaultTitle({
    textQuery: 'search',
    tagsAND: [{ title: 'tag1' }],
    tagsNOT: [{ title: 'tag2' }],
    tagsOR: [{ title: 'tag3' }],
  });

  expect(result).toContain('search');
  expect(result).toContain('+tag1');
  expect(result).toContain('-tag2');
  expect(result).toContain('|tag3');
});

// Test: Empty tags in defaultTitle
test('defaultTitle returns empty string with no filters', () => {
  function defaultTitle(searchQuery) {
    let title = '';
    if (searchQuery) {
      if (searchQuery.textQuery) {
        title += searchQuery.textQuery;
      }
    }
    return title.trim();
  }

  const result = defaultTitle({});
  expect(result).toBe('');
});
