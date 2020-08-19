import Search from '../../app/services/search';

const mockedSearchIndex = { data: {} };
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
});
