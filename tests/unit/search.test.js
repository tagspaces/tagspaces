import Search from '../../app/services/search';

/*const mockedSearchIndex = { data: {} };
const SearchMock = jest.fn();
SearchMock.mockReturnValue(Promise.resolve(mockedSearchIndex));
Search.searchLocationIndex = SearchMock;

jest.mock('../../app/services/search');

test('calls Search.searchLocationIndex with the params', () => {
  const locationContent = [];
  const searchQuery = {
    tagsAND: ['tag'],
    maxSearchResults: 1
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual(mockedSearchIndex);
  expect(SearchMock).toHaveBeenCalledWith(locationContent, searchQuery);
});*/

/*const searchQuery: SearchQuery = {
  textQuery: this.state.textQuery,
  tagsAND: this.state.tagsAND,
  tagsOR: this.state.tagsOR,
  tagsNOT: this.state.tagsNOT,
  // @ts-ignore
  searchBoxing: this.state.searchBoxing,
  fileTypes: this.state.fileTypes,
  lastModified: this.state.lastModified,
  fileSize: this.state.fileSize,
  tagTimePeriodFrom: this.state.tagTimePeriodFrom
      ? this.state.tagTimePeriodFrom.getTime()
      : null,
  tagTimePeriodTo: this.state.tagTimePeriodTo
      ? this.state.tagTimePeriodTo.getTime()
      : null,
  tagPlaceLat: this.state.tagPlaceLat,
  tagPlaceLong: this.state.tagPlaceLong,
  tagPlaceRadius: this.state.tagPlaceRadius,
  maxSearchResults: this.props.maxSearchResults,
  currentDirectory: this.props.currentDirectory,
  forceIndexing: this.state.forceIndexing
};*/

const tag1 = { title: 'tagTitle1' };
const tag2 = { title: 'tagTitle2' };
const tag3 = { title: 'tagTitle3' };

const entry1 = {
  name: 'entryTitle1',
  description: 'test description',
  isFile: true,
  extension: 'jpg',
  tags: [tag1],
  size: 111,
  path: '/gg/'
};

const entry2 = {
  name: 'entryTitle2',
  isFile: true,
  extension: 'jpg',
  tags: [tag2],
  size: 111,
  path: '/gg/'
};

test('calls Search.searchLocationIndex for tags', () => {
  const locationContent = [entry1, entry2]; //enhanceEntry(entry)];

  const searchQuery = {
    tagsAND: [tag1],
    maxSearchResults: 2
  };

  const searchQueryNotExist = {
    tagsAND: [tag3],
    maxSearchResults: 2
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual([entry1]);

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.not.toStrictEqual([entry2]);

  expect(
    Search.searchLocationIndex(locationContent, searchQueryNotExist)
  ).resolves.toStrictEqual([]);
});

test('calls Search.searchLocationIndex for textQuery', () => {
  const locationContent = [entry1, entry2];

  const searchQuery = {
    textQuery: 'description'
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual([entry1]);
});

//jest.mock('../../app/pro', () => require('../../extensions/pro'));
//jest.mock('../../extensions/pro/modules/thumbsgenerator');
//jest.mock('../../app/services/platform-io');

/*
test('calls Search.searchLocationIndex for Pro', () => {

  const locationContent = [entry1, entry2];

  const searchQuery = {
    textQuery: 'description'
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual([entry1]);
});
*/
