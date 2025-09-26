import { Pro } from '-/pro';
import {
  SearchActions,
  SearchOptionType,
  SearchQueryComposition,
} from '-/components/SearchOptions';

export function getSearchOptions(): Array<SearchOptionType> {
  const options = [];

  options.push({
    id: SearchActions.LOCATION.shortName,
    label: SearchActions.LOCATION.shortName,
    fullName: SearchActions.LOCATION.fullName,
    action: SearchActions.LOCATION.shortName,
    descr: 'find and open a location',
    group: 'actions',
  });
  options.push({
    id: SearchActions.FILTER.shortName,
    label: SearchActions.FILTER.shortName,
    fullName: SearchActions.FILTER.fullName,
    action: SearchActions.FILTER.shortName,
    descr: 'filter the entries from the current folder',
    group: 'actions',
  });
  if (Pro) {
    options.push({
      id: SearchActions.HISTORY.shortName,
      label: SearchActions.HISTORY.shortName,
      fullName: SearchActions.HISTORY.fullName,
      action: SearchActions.HISTORY.shortName,
      descr: 'find recently used files and folders',
      group: 'actions',
    });
  }
  if (Pro) {
    options.push({
      id: SearchActions.BOOK.shortName,
      label: SearchActions.BOOK.shortName,
      fullName: SearchActions.BOOK.fullName,
      action: SearchActions.BOOK.shortName,
      descr: 'find bookmarks',
      group: 'actions',
    });
  }

  options.push({
    id: SearchActions.SEARCH.shortName,
    label: SearchActions.SEARCH.shortName,
    fullName: SearchActions.SEARCH.fullName,
    action: SearchActions.SEARCH.shortName,
    descr: 'find and execute saved search queries',
    group: 'actions',
  });

  if (Pro) {
    options.push({
      id: SearchActions.SEARCH_HISTORY.shortName,
      label: SearchActions.SEARCH_HISTORY.shortName,
      fullName: SearchActions.SEARCH_HISTORY.fullName,
      action: SearchActions.SEARCH_HISTORY.shortName,
      descr: 'Execute search queries from history',
      group: 'actions',
    });
  }
  options.push({
    id: SearchQueryComposition.TAG_AND.shortName,
    label: SearchQueryComposition.TAG_AND.shortName,
    action: SearchQueryComposition.TAG_AND.shortName,
    descr:
      'entries should have this tag to be included in the results (logical AND)',
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TAG_NOT.shortName,
    label: SearchQueryComposition.TAG_NOT.shortName,
    action: SearchQueryComposition.TAG_NOT.shortName,
    descr:
      'entries should not have this tag to be included in the results (logical NOT)',
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TAG_OR.shortName,
    label: SearchQueryComposition.TAG_OR.shortName,
    action: SearchQueryComposition.TAG_OR.shortName,
    descr:
      'allows searching for entries having one tag or another (logical OR)',
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TYPE.shortName,
    label: SearchQueryComposition.TYPE.shortName,
    fullName: SearchQueryComposition.TYPE.fullName,
    action: SearchQueryComposition.TYPE.shortName,
    descr: 'filter by file type: document, video, files, folders',
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.SIZE.shortName,
    label: SearchQueryComposition.SIZE.shortName,
    fullName: SearchQueryComposition.SIZE.fullName,
    action: SearchQueryComposition.SIZE.shortName,
    descr: 'list sizes from advanced search',
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.LAST_MODIFIED.shortName,
    label: SearchQueryComposition.LAST_MODIFIED.shortName,
    fullName: SearchQueryComposition.LAST_MODIFIED.fullName,
    action: SearchQueryComposition.LAST_MODIFIED.shortName,
    descr: 'list last modified options from advanced search',
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.DATE_CREATED.shortName,
    label: SearchQueryComposition.DATE_CREATED.shortName,
    fullName: SearchQueryComposition.DATE_CREATED.fullName,
    action: SearchQueryComposition.DATE_CREATED.shortName,
    descr: 'list date created options from advanced search',
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.SCOPE.shortName,
    label: SearchQueryComposition.SCOPE.shortName,
    fullName: SearchQueryComposition.SCOPE.fullName,
    action: SearchQueryComposition.SCOPE.shortName,
    descr: 'scope of the search: location, folder, global',
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.ACCURACY.shortName,
    label: SearchQueryComposition.ACCURACY.shortName,
    fullName: SearchQueryComposition.ACCURACY.fullName,
    action: SearchQueryComposition.ACCURACY.shortName,
    descr: 'accuracy: fuzzy, semi strict, strict',
    group: 'query',
  });
  return options;
}
