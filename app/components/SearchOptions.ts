export interface SearchOptionType {
  id?: string;
  label: string;
  descr?: string;
  action: string;
  group?: string;
}

export const SearchQueryComposition = {
  TAG_AND: '+',
  TAG_NOT: '-',
  TAG_OR: '|',
  TYPE: 't:',
  SIZE: 's:',
  LAST_MODIFIED: 'lm:',
  SCOPE: 'sc:',
  ACCURACY: 'a:'
};

export const SearchCommandAlternatives = {
  TYPE: 'type:',
  SIZE: 'size:',
  LAST_MODIFIED: 'lastmod:',
  SCOPE: 'scope:',
  ACCURACY: 'accuracy:',
  LOCATION: 'location:',
  FILTER: 'filter:',
  HISTORY: 'history:',
  BOOK: 'bookmark:',
  SEARCH: 'search:'
};

export const SearchActions = {
  LOCATION: 'l:',
  FILTER: 'f:',
  HISTORY: 'h:',
  BOOK: 'b:',
  SEARCH: 'sav:'
};

export const ExecActions = {
  OPEN_LOCATION: 'open_location',
  OPEN_HISTORY: 'open_history',
  TAG_SEARCH_AND: 'tag_search_and',
  TAG_SEARCH_NOT: 'tag_search_not',
  TAG_SEARCH_OR: 'tag_search_or',
  TYPE_SEARCH: 'type_search',
  SIZE_SEARCH: 'size_search',
  LAST_MODIFIED_SEARCH: 'last_modified_search',
  SCOPE_SEARCH: 'scope_search',
  ACCURACY_SEARCH: 'accuracy_search'
};

export const FileSize = {
  sizeEmpty: 0,
  sizeTiny: 10000, // 10KB
  sizeVerySmall: 100000, // 100KB
  sizeSmall: 1000000, // 1MB
  sizeMedium: 50000000, // 50 mB
  sizeLarge: 1000000000, // 1GB
  sizeHuge: 1000000001 // over 1GB
};

export const LastModified = {
  today: 86400000, // 1 day
  yesterday: 172800000, // 48 hours
  past7Days: 604800000, // 7 days
  past30Days: 2592000000, // 30 days
  past6Months: 15778476000, // 6 months
  pastYear: 31556952000, // 1 year
  moreThanYear: 31556952001 // over 1 year
};
export const scope = {
  location: 'location',
  folder: 'folder',
  global: 'global'
};

export const accuracy = {
  fuzzy: 'fuzzy',
  semistrict: 'semistrict',
  strict: 'strict'
};

export type ScopeType = 'location' | 'folder' | 'global';

export function findAction(option: string, equal = false): string {
  const actions = [
    ...Object.values(SearchQueryComposition),
    ...Object.values(SearchActions)
  ];
  let action = actions.find(a => (equal ? option === a : option.startsWith(a)));
  if (!action) {
    action = Object.values(SearchCommandAlternatives).find(a =>
      equal ? option === a : option.startsWith(a)
    );
  }
  return action;
}

export const SearchOptions = [
  {
    id: SearchActions.LOCATION,
    label: SearchActions.LOCATION,
    action: SearchActions.LOCATION,
    descr: 'for searching in location',
    group: 'actions'
  },
  {
    id: SearchActions.FILTER,
    label: SearchActions.FILTER,
    action: SearchActions.FILTER,
    descr: 'should filter the current directory list',
    group: 'actions'
  },
  {
    id: SearchActions.HISTORY,
    label: SearchActions.HISTORY,
    action: SearchActions.HISTORY,
    descr: 'should search in the all recent file and folder lists',
    group: 'actions'
  },
  {
    id: SearchActions.BOOK,
    label: SearchActions.BOOK,
    action: SearchActions.BOOK,
    descr: 'should search in the bookmarks',
    group: 'actions'
  },
  {
    id: SearchActions.SEARCH,
    label: SearchActions.SEARCH,
    action: SearchActions.SEARCH,
    descr: 'saved searched',
    group: 'actions'
  },
  {
    id: SearchQueryComposition.TAG_AND,
    label: SearchQueryComposition.TAG_AND,
    action: SearchQueryComposition.TAG_AND,
    descr: 'Tag AND',
    group: 'query'
  },
  {
    id: SearchQueryComposition.TAG_NOT,
    label: SearchQueryComposition.TAG_NOT,
    action: SearchQueryComposition.TAG_NOT,
    descr: 'Tag NOT',
    group: 'query'
  },
  {
    id: SearchQueryComposition.TAG_OR,
    label: SearchQueryComposition.TAG_OR,
    action: SearchQueryComposition.TAG_OR,
    descr: 'Tag OR',
    group: 'query'
  },
  {
    id: SearchQueryComposition.TYPE,
    label: SearchQueryComposition.TYPE,
    action: SearchQueryComposition.TYPE,
    descr: 'filter by file type: document, video, files, folders',
    group: 'query'
  },
  {
    id: SearchQueryComposition.SIZE,
    label: SearchQueryComposition.SIZE,
    action: SearchQueryComposition.SIZE,
    descr: 'list sizes from advanced search',
    group: 'query'
  },
  {
    id: SearchQueryComposition.LAST_MODIFIED,
    label: SearchQueryComposition.LAST_MODIFIED,
    action: SearchQueryComposition.LAST_MODIFIED,
    descr: 'list last modified options from advanced search',
    group: 'query'
  },
  {
    id: SearchQueryComposition.SCOPE,
    label: SearchQueryComposition.SCOPE,
    action: SearchQueryComposition.SCOPE,
    descr: 'scope of the search: location, folder, global',
    group: 'query'
  },
  {
    id: SearchQueryComposition.ACCURACY,
    label: SearchQueryComposition.ACCURACY,
    action: SearchQueryComposition.ACCURACY,
    descr: 'accuracy: fuzzy, semi strict, strict',
    group: 'query'
  }
];
