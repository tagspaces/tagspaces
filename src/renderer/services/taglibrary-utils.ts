import AppConfig from '-/AppConfig';
import { saveAsTextFile } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import versionMeta from '-/version.json';
import {
  formatDateTime4Tag,
  prepareTagGroupForExport,
} from '@tagspaces/tagspaces-common/misc';
import defaultTagLibrary from '../reducers/taglibrary-default';
import TagGroup = TS.TagGroup;

export const tagLibraryKey = 'tsTagLibrary';

export function getTagLibrary(): TS.TagGroup[] {
  if (AppConfig.ExtTagLibrary) {
    return AppConfig.ExtTagLibrary.map((tagGroup) => ({
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

/**
 * Run each tag group through prepareTagGroupForExport and keep only the ones
 * with a title + uuid. Shared by the legacy exporter and the unified
 * export/import dialog so both produce an identical tag-group payload.
 */
export function prepareTagGroupsForExport(
  entry: Array<TS.TagGroup>,
): TS.TagGroup[] {
  const allTagGroups: TS.TagGroup[] = [];
  (entry || []).forEach((value) => {
    const preparedTagGroup = prepareTagGroupForExport(value);
    if (preparedTagGroup.title && preparedTagGroup.uuid) {
      allTagGroups.push(preparedTagGroup);
    }
  });
  return allTagGroups;
}

export function exportTagGroups(
  entry: Array<TS.TagGroup>,
  settingsVersion = 3,
) {
  const jsonFormat =
    '{ "appName": "' +
    versionMeta.name +
    '", "appVersion": "' +
    versionMeta.version +
    '", "settingsVersion": ' +
    settingsVersion +
    ', "tagGroups": ';
  const allTagGroups = prepareTagGroupsForExport(entry);

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
