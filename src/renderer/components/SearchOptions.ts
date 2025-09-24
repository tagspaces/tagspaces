import { TS } from '-/tagspaces.namespace';

export interface SearchOptionType {
  id?: string;
  label: string;
  fullName?: string;
  descr?: string;
  color?: string;
  textcolor?: string;
  action: string;
  group?: string;
  searchQuery?: TS.SearchQuery;
  filter?: boolean;
}

export type ActionType = { shortName: string; fullName?: string };

export const SearchQueryComposition = {
  TAG_AND: {
    shortName: '+',
  },
  TAG_NOT: {
    shortName: '-',
    // fullName: '—'
  },
  TAG_OR: {
    shortName: '|',
  },
  TYPE: {
    shortName: 't:',
    fullName: 'type:',
  },
  SIZE: {
    shortName: 'si:',
    fullName: 'size:',
  },
  LAST_MODIFIED: {
    shortName: 'lm:',
    fullName: 'modified:',
  },
  DATE_CREATED: {
    shortName: 'cd:',
    fullName: 'created:',
  },
  SCOPE: {
    shortName: 'sc:',
    fullName: 'scope:',
  },
  ACCURACY: {
    shortName: 'a:',
    fullName: 'accuracy:',
  },
};

export const SearchActions = {
  LOCATION: {
    shortName: 'l:',
    fullName: 'locations',
  },
  FILTER: {
    shortName: 'f:',
    fullName: 'filter',
  },
  HISTORY: {
    shortName: 'h:',
    fullName: 'history',
  },
  BOOK: {
    shortName: 'b:',
    fullName: 'bookmarks',
  },
  SEARCH: {
    shortName: 'q:',
    fullName: 'search-queries',
  },
  SEARCH_HISTORY: {
    shortName: 's:',
    fullName: 'search-history',
  },
};

export const ExecActions = {
  OPEN_LOCATION: 'open_location',
  OPEN_HISTORY: 'open_history',
  OPEN_BOOKMARK: 'open_bookmark',
  OPEN_SAVED_SEARCHES: 'open_saved_searches',
  TAG_SEARCH_AND: 'tag_search_and',
  TAG_SEARCH_NOT: 'tag_search_not',
  TAG_SEARCH_OR: 'tag_search_or',
  TYPE_SEARCH: 'type_search',
  SIZE_SEARCH: 'size_search',
  LAST_MODIFIED_SEARCH: 'last_modified_search',
  DATE_CREATED_SEARCH: 'date_created_search',
  SCOPE_SEARCH: 'scope_search',
  ACCURACY_SEARCH: 'accuracy_search',
};

export const scope = {
  location: 'location' as ScopeType,
  folder: 'folder' as ScopeType,
  global: 'global' as ScopeType,
};

export const accuracy = {
  fuzzy: 'fuzzy',
  semistrict: 'semistrict',
  strict: 'strict',
};

export type ScopeType = 'location' | 'folder' | 'global';

export function isAction(action: string, actionType: ActionType): boolean {
  return (
    action !== undefined &&
    (action === actionType.shortName || action === actionType.fullName)
  );
}

export function findAction(option: string, equal = false): string {
  const actions: Array<ActionType> = [
    ...Object.values(SearchQueryComposition),
    ...Object.values(SearchActions),
  ];
  let action = actions.find((a) =>
    equal
      ? option === a.shortName || option === a.fullName
      : option.startsWith(a.shortName) || option.startsWith(a.fullName),
  );
  if (action) {
    return action.fullName ? action.fullName : action.shortName;
  }
  return undefined;
}
