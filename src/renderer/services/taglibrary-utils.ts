import { TS } from '-/tagspaces.namespace';
import {
  formatDateTime4Tag,
  prepareTagGroupForExport,
} from '@tagspaces/tagspaces-common/misc';
import versionMeta from '-/version.json';
import { saveAsTextFile } from '-/services/utils-io';
import defaultTagLibrary from '../reducers/taglibrary-default';
import TagGroup = TS.TagGroup;

export const tagLibraryKey = 'tsTagLibrary';

export function getTagLibrary(): TS.TagGroup[] {
  if (window.ExtTagLibrary) {
    return window.ExtTagLibrary.map((tagGroup) => ({
      ...tagGroup,
      readOnly: true,
    }));
  }
  const item = localStorage.getItem(tagLibraryKey);
  if (item) {
    return JSON.parse(item);
  }
  return defaultTagLibrary;
}

export function setTagLibrary(tagGroups: TS.TagGroup[]) {
  if (tagGroups) {
    localStorage.setItem(
      tagLibraryKey,
      JSON.stringify(
        tagGroups.filter((tg) => tg.locationId === undefined && !tg.readOnly),
      ),
    );
  }
}

/**
 * @param tagGroups
 * @param currentWorkSpace
 * @param fallbackToLibrary explicit option so caller knows the behavior
 */
export function getAllTags(
  tagGroups?: TS.TagGroup[],
  currentWorkSpace?: TS.WorkSpace,
  fallbackToLibrary = true,
): TS.Tag[] {
  const groups = tagGroups ?? getTagLibrary();

  let groupsToUse = groups;
  if (currentWorkSpace) {
    groupsToUse = groups.filter((t) => t.workSpaceId === currentWorkSpace.uuid);
    if (groupsToUse.length === 0 && fallbackToLibrary) {
      groupsToUse = getTagLibrary();
    }
  }

  const seen = new Set<string>();
  const uniqueTags: TS.Tag[] = [];

  for (const group of groupsToUse) {
    // safely iterate even if children is undefined/null
    for (const tag of group.children ?? []) {
      // use title for uniqueness (or switch to an id if available: tag.id || tag.uuid)
      const key = tag.title ?? '';
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTags.push(tag);
      }
    }
  }

  // return uniqueTags.sort((a, b) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0, );
  // localeCompare handles locale-specific ordering; "sensitivity: 'base'" makes it case-insensitive
  return uniqueTags.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
}

export function exportTagGroups(
  entry: Array<TS.TagGroup>,
  settingsVersion = 3,
) {
  const tagLibrary = entry;
  const jsonFormat =
    '{ "appName": "' +
    versionMeta.name +
    '", "appVersion": "' +
    versionMeta.version +
    '", "settingsVersion": ' +
    settingsVersion +
    ', "tagGroups": ';
  const allTagGroups = [];
  tagLibrary.forEach((value) => {
    const preparedTagGroup = prepareTagGroupForExport(value);
    if (preparedTagGroup.title && preparedTagGroup.uuid) {
      allTagGroups.push(preparedTagGroup);
    }
  });

  const blob = new Blob(
    [jsonFormat + JSON.stringify(allTagGroups, null, 2) + '}'],
    {
      type: 'application/json',
    },
  );
  const dateTimeTag = formatDateTime4Tag(new Date(), true);
  saveAsTextFile(blob, 'tag-library [tagspaces ' + dateTimeTag + '].json');
  console.log('Tag library exported...');
}

/**
 * get tagColor used to show color of the filename tags
 */
export const getTagColors = (
  tagTitle: string,
  tagGroups: TagGroup[],
  defaultTextColor: string,
  defaultBackgroundColor: string,
) => {
  const tagExist = getAllTags(tagGroups).find(
    (tag: TS.Tag) => tag.title === tagTitle,
  );
  return tagExist
    ? {
        textcolor: tagExist.textcolor || defaultTextColor,
        color: tagExist.color || defaultBackgroundColor,
      }
    : {
        textcolor: defaultTextColor,
        color: defaultBackgroundColor,
      };
};
