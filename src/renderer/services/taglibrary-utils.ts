import { TS } from '-/tagspaces.namespace';
import {
  formatDateTime4Tag,
  prepareTagGroupForExport,
} from '@tagspaces/tagspaces-common/misc';
import versionMeta from '-/version.json';
import { saveAsTextFile } from '-/services/utils-io';
import defaultTagLibrary from '../reducers/taglibrary-default';

export const tagLibraryKey = 'tsTagLibrary';

export function getTagLibrary(): TS.TagGroup[] {
  if (window.ExtTagLibrary) {
    return window.ExtTagLibrary;
  }
  const item = localStorage.getItem(tagLibraryKey);
  if (item) {
    return JSON.parse(item);
  }
  return defaultTagLibrary;
}

export function setTagLibrary(
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  if (tagGroups && tagGroups.length > 0) {
    localStorage.setItem(tagLibraryKey, JSON.stringify(tagGroups));
  }
  return tagGroups;
}

export function getAllTags(tagGroups?: Array<TS.TagGroup>) {
  if (tagGroups === undefined) {
    tagGroups = getTagLibrary();
  }
  const uniqueTags: TS.Tag[] = [];
  tagGroups.forEach((tagGroup) => {
    tagGroup.children.forEach((tag) => {
      const found = uniqueTags.find((uTag) => uTag.title === tag.title);
      if (!found) {
        uniqueTags.push(tag);
      }
    });
  });
  return uniqueTags.sort((a, b) =>
    a.title > b.title ? 1 : a.title < b.title ? -1 : 0,
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
  defaultTextColor: string,
  defaultBackgroundColor: string,
) => {
  const tagColors = {
    textcolor: defaultTextColor,
    color: defaultBackgroundColor,
  };
  getAllTags().forEach((tag: TS.Tag) => {
    if (tag.title === tagTitle) {
      tagColors.textcolor = tag.textcolor;
      tagColors.color = tag.color;
    }
  });
  return tagColors;
};
