import Search from '../../app/services/search';
import { entry1, entry2, entry3 } from './testEntries';

// const mockedSearchIndex = { data: {} };
// const SearchMock = jest.fn();
// SearchMock.mockReturnValue(Promise.resolve(mockedSearchIndex));
// Search.searchLocationIndex = SearchMock;

// jest.mock('../../app/services/search');

// test('calls Search.searchLocationIndex with the params', () => {
//   const locationContent = [];
//   const searchQuery = {
//     tagsAND: ['tag'],
//     maxSearchResults: 1
//   };

//   expect(
//     Search.searchLocationIndex(locationContent, searchQuery)
//   ).resolves.toStrictEqual(mockedSearchIndex);
//   expect(SearchMock).toHaveBeenCalledWith(locationContent, searchQuery);
// });

const tag1 = { title: 'tagTitle1' };
const tag2 = { title: 'tagTitle2' };
const tag3 = { title: 'tagTitle3' };

// test('calls Search.searchLocationIndex for tags', () => {
//   const locationContent = [entry1, entry2]; //enhanceEntry(entry)];

//   const searchQuery = {
//     tagsAND: [tag1],
//     maxSearchResults: 2
//   };

//   const searchQueryNotExist = {
//     tagsAND: [tag3],
//     maxSearchResults: 2
//   };

//   expect(
//     Search.searchLocationIndex(locationContent, searchQuery)
//   ).resolves.toStrictEqual([entry1]);

//   expect(
//     Search.searchLocationIndex(locationContent, searchQuery)
//   ).resolves.not.toStrictEqual([entry2]);

//   expect(
//     Search.searchLocationIndex(locationContent, searchQueryNotExist)
//   ).resolves.toStrictEqual([]);
// });

test('calls Search.searchLocationIndex for tags', () => {
  const locationContent = [entry1, entry2];

  const searchQuery = {
    tagsAND: [tag1],
    maxSearchResults: 2
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual([entry1]);

  // expect(
  //   Search.searchLocationIndex(locationContent, searchQuery)
  // ).resolves.not.toStrictEqual([entry2]);
});

test('calls Search.searchLocationIndex for tags with not to equal', () => {
  const locationContent = [entry1, entry2];

  const searchQuery = {
    tagsAND: [tag1],
    maxSearchResults: 2
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.not.toStrictEqual([entry2]);
});

test('calls Search.searchLocationIndex for not exist tags', () => {
  const locationContent = [entry1, entry2];

  const searchQueryNotExist = {
    tagsAND: [tag3],
    maxSearchResults: 2
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQueryNotExist)
  ).resolves.toStrictEqual([]);
});

test('calls Search.searchLocationIndex for OR tags', () => {
  const locationContent = [entry1, entry2, entry3]; //enhanceEntry(entry)];

  const searchQuery = {
    tagsNOT: [tag1],
    maxSearchResults: 2
  };

  const searchQueryNotExist = {
    tagsNOT: [tag3],
    maxSearchResults: 2
  };

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.toStrictEqual([entry1, entry2]);

  expect(
    Search.searchLocationIndex(locationContent, searchQuery)
  ).resolves.not.toStrictEqual([entry3]);

  expect(
    Search.searchLocationIndex(locationContent, searchQueryNotExist)
  ).resolves.toStrictEqual([]);
});

test('calls Search.searchLocationIndex for textQuery', async () => {
  const locationContent = [entry1, entry2];

  const searchQuery = {
    textQuery: 'description'
  };

  const searchResults = await Search.searchLocationIndex(
    locationContent,
    searchQuery
  );
  expect(searchResults[0].name).toStrictEqual('entryTitle1');
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

test.skip('calls Search.searchLocationIndex for extension', async () => {
  const locationContent = [entry2, entry3];

  const searchQuery = {
    fileTypes: 'jpg'
  };

  const searchResults = await Search.searchLocationIndex(
    locationContent,
    searchQuery
  );
  expect(searchResults).resolves.toStrictEqual('jpg');
});

test.skip('calls Search.searchLocationIndex for fileSize', async () => {
  const locationContent = [entry1, entry2];

  const searchQuery = {
    fileSize: 'sizeTiny'
  };

  const searchResults = await Search.searchLocationIndex(
    locationContent,
    searchQuery
  );
  expect(searchResults[9].fileSize).resolves.toStrictEqual('sizeTiny');
});

test('calls Search.searchLocationIndex for folder', async () => {
  const locationContent = [entry1, entry2, entry3];

  const searchQuery = {
    textQuery: 'testfolder1'
  };

  const searchResults = await Search.searchLocationIndex(
    locationContent,
    searchQuery
  );

  expect(searchResults[0].name).toStrictEqual('testFolder1');
});
