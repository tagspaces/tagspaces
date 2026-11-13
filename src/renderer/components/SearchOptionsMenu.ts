import { Pro } from '-/pro';
import i18n from '-/services/i18n';
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
    descr: i18n.t('core:searchOptLocation'),
    group: 'actions',
  });
  options.push({
    id: SearchActions.FILTER.shortName,
    label: SearchActions.FILTER.shortName,
    fullName: SearchActions.FILTER.fullName,
    action: SearchActions.FILTER.shortName,
    descr: i18n.t('core:searchOptFilter'),
    group: 'actions',
  });
  if (Pro) {
    options.push({
      id: SearchActions.HISTORY.shortName,
      label: SearchActions.HISTORY.shortName,
      fullName: SearchActions.HISTORY.fullName,
      action: SearchActions.HISTORY.shortName,
      descr: i18n.t('core:searchOptHistory'),
      group: 'actions',
    });
  }
  if (Pro) {
    options.push({
      id: SearchActions.BOOK.shortName,
      label: SearchActions.BOOK.shortName,
      fullName: SearchActions.BOOK.fullName,
      action: SearchActions.BOOK.shortName,
      descr: i18n.t('core:searchOptBookmarks'),
      group: 'actions',
    });
  }

  options.push({
    id: SearchActions.SEARCH.shortName,
    label: SearchActions.SEARCH.shortName,
    fullName: SearchActions.SEARCH.fullName,
    action: SearchActions.SEARCH.shortName,
    descr: i18n.t('core:searchOptSavedSearches'),
    group: 'actions',
  });

  if (Pro) {
    options.push({
      id: SearchActions.SEARCH_HISTORY.shortName,
      label: SearchActions.SEARCH_HISTORY.shortName,
      fullName: SearchActions.SEARCH_HISTORY.fullName,
      action: SearchActions.SEARCH_HISTORY.shortName,
      descr: i18n.t('core:searchOptSearchHistory'),
      group: 'actions',
    });
  }
  options.push({
    id: SearchQueryComposition.TAG_AND.shortName,
    label: SearchQueryComposition.TAG_AND.shortName,
    action: SearchQueryComposition.TAG_AND.shortName,
    descr: i18n.t('core:searchOptTagAnd'),
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TAG_NOT.shortName,
    label: SearchQueryComposition.TAG_NOT.shortName,
    action: SearchQueryComposition.TAG_NOT.shortName,
    descr: i18n.t('core:searchOptTagNot'),
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TAG_OR.shortName,
    label: SearchQueryComposition.TAG_OR.shortName,
    action: SearchQueryComposition.TAG_OR.shortName,
    descr: i18n.t('core:searchOptTagOr'),
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.TYPE.shortName,
    label: SearchQueryComposition.TYPE.shortName,
    fullName: SearchQueryComposition.TYPE.fullName,
    action: SearchQueryComposition.TYPE.shortName,
    descr: i18n.t('core:searchOptType'),
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.SIZE.shortName,
    label: SearchQueryComposition.SIZE.shortName,
    fullName: SearchQueryComposition.SIZE.fullName,
    action: SearchQueryComposition.SIZE.shortName,
    descr: i18n.t('core:searchOptSize'),
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.LAST_MODIFIED.shortName,
    label: SearchQueryComposition.LAST_MODIFIED.shortName,
    fullName: SearchQueryComposition.LAST_MODIFIED.fullName,
    action: SearchQueryComposition.LAST_MODIFIED.shortName,
    descr: i18n.t('core:searchOptLastModified'),
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.DATE_CREATED.shortName,
    label: SearchQueryComposition.DATE_CREATED.shortName,
    fullName: SearchQueryComposition.DATE_CREATED.fullName,
    action: SearchQueryComposition.DATE_CREATED.shortName,
    descr: i18n.t('core:searchOptDateCreated'),
    group: 'query',
  });

  options.push({
    id: SearchQueryComposition.SCOPE.shortName,
    label: SearchQueryComposition.SCOPE.shortName,
    fullName: SearchQueryComposition.SCOPE.fullName,
    action: SearchQueryComposition.SCOPE.shortName,
    descr: i18n.t('core:searchOptScope'),
    group: 'query',
  });
  options.push({
    id: SearchQueryComposition.ACCURACY.shortName,
    label: SearchQueryComposition.ACCURACY.shortName,
    fullName: SearchQueryComposition.ACCURACY.fullName,
    action: SearchQueryComposition.ACCURACY.shortName,
    descr: i18n.t('core:searchOptAccuracy'),
    group: 'query',
  });
  return options;
}
