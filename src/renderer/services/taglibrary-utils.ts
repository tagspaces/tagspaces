import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import {
  formatDateTime4Tag,
  immutablySwapItems,
  prepareTagGroupForExport,
} from '@tagspaces/tagspaces-common/misc';
import versionMeta from '-/version.json';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { parseNewTags, saveAsTextFile } from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import defaultTagLibrary from '../reducers/taglibrary-default';

export const tagLibraryKey = 'tsTagLibrary';

export function getTagLibrary(): Array<TS.TagGroup> {
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

export function removeTagGroup(
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
  locations: Array<TS.Location>,
): Array<TS.TagGroup> {
  const indexForRemoving = tagGroups.findIndex(
    (t) => t.uuid === parentTagGroupUuid,
  );
  if (indexForRemoving >= 0) {
    const tagGroup: TS.TagGroup = tagGroups[indexForRemoving];
    if (Pro && tagGroup && tagGroup.locationId) {
      const location: TS.Location = locations.find(
        (l) => l.uuid === tagGroup.locationId,
      );
      if (location) {
        Pro.MetaOperations.removeTagGroup(location.path, parentTagGroupUuid);
      }
    }

    return setTagLibrary([
      ...tagGroups.slice(0, indexForRemoving),
      ...tagGroups.slice(indexForRemoving + 1),
    ]);
  }

  return tagGroups;
}

export function moveTagGroupUp(
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  let indexForUpdating = tagGroups.findIndex(
    (t) => t.uuid === parentTagGroupUuid,
  );
  if (indexForUpdating > 0) {
    const secondIndex = indexForUpdating - 1;
    return setTagLibrary(
      immutablySwapItems(tagGroups, indexForUpdating, secondIndex),
    );
  }
  return tagGroups;
}

export function moveTagGroupDown(
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  let indexForUpdating = tagGroups.findIndex(
    (t) => t.uuid === parentTagGroupUuid,
  );
  if (indexForUpdating >= 0 && indexForUpdating < tagGroups.length - 1) {
    const secondIndex = indexForUpdating + 1;
    return setTagLibrary(
      immutablySwapItems(tagGroups, indexForUpdating, secondIndex),
    );
  }
  return tagGroups;
}

export function moveTagGroup(
  tagGroupUuid: TS.Uuid,
  position: number,
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  let indexForUpdating = tagGroups.findIndex((t) => t.uuid === tagGroupUuid);
  if (indexForUpdating > -1 && indexForUpdating !== position) {
    const tagGroupsReturn = Array.from(tagGroups);
    const [removed] = tagGroupsReturn.splice(indexForUpdating, 1);
    tagGroupsReturn.splice(position, 0, removed);
    return setTagLibrary(tagGroupsReturn);
  }
  return tagGroups;
}

export function sortTagGroup(
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  let indexForUpdating = tagGroups.findIndex(
    (t) => t.uuid === parentTagGroupUuid,
  );
  if (indexForUpdating > -1) {
    return setTagLibrary([
      ...tagGroups.slice(0, indexForUpdating),
      {
        ...tagGroups[indexForUpdating],
        children: tagGroups[indexForUpdating].children.sort((a, b) =>
          a.title > b.title ? 1 : a.title < b.title ? -1 : 0,
        ),
      },
      ...tagGroups.slice(indexForUpdating + 1),
    ]);
  }
  return tagGroups;
}

export function importTagGroups(
  newEntries: Array<TS.TagGroup>,
  tagGroups: Array<TS.TagGroup>,
  replace = false,
): Array<TS.TagGroup> {
  const arr = replace ? [] : [...tagGroups];
  // console.log(arr);
  // @ts-ignore
  if (newEntries[0] && newEntries[0].key) {
    // TODO test this migration
    newEntries.forEach((newTg: TS.TagGroup, index) => {
      // migration of old tag groups 2.9 or less in the new version 3.0-present
      // @ts-ignore
      if (newTg.key === tagGroups.uuid || newTg.key !== tagGroups.uuid) {
        newTg = {
          title: newTg.title,
          // @ts-ignore
          uuid: newTg.key,
          children: newTg.children,
        };
        const tagsArr = [];
        newTg.children.forEach((tag) => {
          tagsArr.push(tag);
          newTg.children = tagsArr;
          arr.push(newTg);
        });
      }
    });
  } else {
    newEntries.forEach((tagGroup) => {
      const index = arr.findIndex((obj) => obj.uuid === tagGroup.uuid);
      if (index > -1) {
        tagGroup.children.forEach((tag) => {
          const stateTag = arr[index].children.find(
            (obj) => obj.title === tag.title,
          );
          if (stateTag === undefined) {
            arr[index].children.push(tag);
          }
        });
        if (tagGroup.locationId) {
          arr[index].locationId = tagGroup.locationId;
        }
      } else {
        arr.push(tagGroup);
      }
    });
  }

  return setTagLibrary(arr);
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

export function createTagGroup(
  entry: TS.TagGroup,
  tagGroups: Array<TS.TagGroup>,
  location?: TS.Location,
): Array<TS.TagGroup> {
  const newEntry = {
    ...entry,
    created_date: new Date().getTime(),
    modified_date: new Date().getTime(),
  };
  if (Pro && location) {
    Pro.MetaOperations.createTagGroup(location.path, newEntry);
  }
  return setTagLibrary([...tagGroups, newEntry]);
}

export function editTag(
  tag: TS.Tag,
  parentTagGroupUuid: TS.Uuid,
  origTitle: string,
  tagGroups: Array<TS.TagGroup>,
  locations: Array<TS.Location>,
): Array<TS.TagGroup> {
  const indexForEditing = tagGroups.findIndex(
    (t) => t.uuid === parentTagGroupUuid,
  );

  if (indexForEditing > -1) {
    const tagGroup: TS.TagGroup = tagGroups[indexForEditing];
    const newTagGroup: TS.TagGroup = {
      ...tagGroup,
      modified_date: new Date().getTime(),
      children: tagGroup.children.map((t) => {
        if (t.title === origTitle) {
          return tag;
        }
        return t;
      }),
    };

    if (Pro && tagGroup && tagGroup.locationId) {
      const location: TS.Location = locations.find(
        (l) => l.uuid === tagGroup.locationId,
      );
      if (location) {
        Pro.MetaOperations.editTagGroup(location.path, newTagGroup, true);
      }
    }
    return updateTagGroup(newTagGroup, tagGroups);
  }
  return tagGroups;
}

export function moveTag(
  tagTitle: string,
  fromTagGroupId: TS.Uuid,
  toTagGroupId: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
) {
  let tagIndexForRemoving = -1;
  let indexFromGroup = -1;
  let indexToGroup = -1;
  tagGroups.forEach((tagGroup, index) => {
    if (tagGroup.uuid === fromTagGroupId) {
      indexFromGroup = index;
    }
    if (tagGroup.uuid === toTagGroupId) {
      indexToGroup = index;
    }
  });
  if (indexFromGroup >= 0 && tagGroups[indexFromGroup].children) {
    tagIndexForRemoving = tagGroups[indexFromGroup].children.findIndex(
      (tag) => tag.title === tagTitle,
    );
  }
  if (indexToGroup >= 0 && indexToGroup >= 0 && tagIndexForRemoving >= 0) {
    const newTagLibrary = [...tagGroups];
    const tag = { ...tagGroups[indexFromGroup].children[tagIndexForRemoving] };
    const found = newTagLibrary[indexToGroup].children.find(
      (t) => t.title === tag.title,
    );
    if (!found) {
      newTagLibrary[indexToGroup].children.push(tag);
      newTagLibrary[indexFromGroup].children = [
        ...newTagLibrary[indexFromGroup].children.slice(0, tagIndexForRemoving),
        ...newTagLibrary[indexFromGroup].children.slice(
          tagIndexForRemoving + 1,
        ),
      ];
      return setTagLibrary(newTagLibrary);
    }
    console.warn('Tag with this title already exists in the target tag group');
  }
  return tagGroups;
}

export function changeTagOrder(
  tagGroupUuid: TS.Uuid,
  fromIndex: number,
  toIndex: number,
  tagGroups: Array<TS.TagGroup>,
) {
  const indexFromGroup = tagGroups.findIndex(
    (tagGroup) => tagGroup.uuid === tagGroupUuid,
  );

  if (indexFromGroup > -1) {
    const newTagLibrary = [...tagGroups];
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#swapping_variables
    [
      newTagLibrary[indexFromGroup].children[fromIndex],
      newTagLibrary[indexFromGroup].children[toIndex],
    ] = [
      newTagLibrary[indexFromGroup].children[toIndex],
      newTagLibrary[indexFromGroup].children[fromIndex],
    ];

    return setTagLibrary(newTagLibrary);
  }
  return tagGroups;
}

export function editTagGroup(
  entry: TS.TagGroup,
  tagGroups: Array<TS.TagGroup>,
  locations: Array<TS.Location>,
) {
  const editedTagGroup = {
    ...entry,
    modified_date: new Date().getTime(),
  };

  if (Pro && entry.locationId) {
    const location: TS.Location = locations.find(
      (l) => l.uuid === entry.locationId,
    );
    if (location) {
      Pro.MetaOperations.editTagGroup(location.path, editedTagGroup);
    }
  }
  return updateTagGroup(editedTagGroup, tagGroups);
}

export function deleteTag(
  tagTitle: string,
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
  locations: Array<TS.Location>,
) {
  const tagGroup: TS.TagGroup = tagGroups.find(
    (t) => t.uuid === parentTagGroupUuid,
  );

  const tagIndexForRemoving = tagGroup.children.findIndex(
    (tag) => tag.title === tagTitle,
  );
  if (tagIndexForRemoving >= 0) {
    const editedTagGroup: TS.TagGroup = {
      ...tagGroup,
      modified_date: new Date().getTime(),
      children: [
        ...tagGroup.children.slice(0, tagIndexForRemoving),
        ...tagGroup.children.slice(tagIndexForRemoving + 1),
      ],
    };

    if (Pro && tagGroup.locationId) {
      const location: TS.Location = locations.find(
        (l) => l.uuid === tagGroup.locationId,
      );
      if (location) {
        Pro.MetaOperations.editTagGroup(location.path, editedTagGroup, true);
      }
    }
    return updateTagGroup(editedTagGroup, tagGroups);
  }
  return tagGroups;
}

export function addTag(
  tag: any,
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
  locations: Array<TS.Location>,
) {
  //  const { tagTextColor, tagBackgroundColor } = settings;
  let tagGroupsReturn = tagGroups;
  const tagGroup: TS.TagGroup = tagGroups.find(
    (t) => t.uuid === parentTagGroupUuid,
  );

  let newTags: Array<TS.Tag>;
  if (typeof tag === 'object' && tag !== null) {
    if (tagGroup.children.some((t) => t.title === tag.title)) {
      // tag exist
      return;
    }
    const tagObject: TS.Tag = {
      ...tag,
      textcolor: tag.textcolor, // || tagTextColor,
      color: tag.color, // || tagBackgroundColor
    };
    newTags = [tagObject];
    tagGroupsReturn = addTagInt(tagObject, parentTagGroupUuid, tagGroups);
  } else {
    const newTagGroup = {
      ...tagGroup,
      color: tagGroup.color, // ? tagGroup.color : tagBackgroundColor,
      textcolor: tagGroup.textcolor, // ? tagGroup.textcolor : tagTextColor
    };
    newTags = parseNewTags(tag, newTagGroup);
    tagGroupsReturn = addTags(newTags, newTagGroup, tagGroups);
  }

  if (Pro && tagGroup && tagGroup.locationId) {
    // const { locations } = getState();
    const location: TS.Location = locations.find(
      (l) => l.uuid === tagGroup.locationId,
    );
    if (location) {
      tagGroup.children = newTags;
      Pro.MetaOperations.editTagGroup(location.path, tagGroup);
    }
  }
  return tagGroupsReturn;
}

export function mergeTagGroup(
  entry: TS.TagGroup,
  tagGroups: Array<TS.TagGroup>,
  locations?: Array<TS.Location>,
) {
  if (Pro && entry.locationId && locations) {
    const location: TS.Location = locations.find(
      (l) => l.uuid === entry.locationId,
    );
    if (location) {
      Pro.MetaOperations.mergeTagGroup(location.path, entry);
    }
  }
  const indexForEditing = tagGroups.findIndex((obj) => obj.uuid === entry.uuid);
  if (indexForEditing > -1) {
    const tags = [...tagGroups[indexForEditing].children, ...entry.children];
    tags.splice(0, tags.length - AppConfig.maxCollectedTag);
    return setTagLibrary([
      ...tagGroups.slice(0, indexForEditing),
      {
        uuid: entry.uuid,
        title: entry.title,
        children: tags,
        created_date: entry.created_date,
        modified_date: new Date().getTime(),
      },
      ...tagGroups.slice(indexForEditing + 1),
    ]);
  }
  return setTagLibrary([
    ...tagGroups,
    {
      uuid: entry.uuid || getUuid(),
      title: entry.title,
      color: entry.color,
      textcolor: entry.textcolor,
      children: entry.children,
      created_date: new Date().getTime(),
      modified_date: new Date().getTime(),
    },
  ]);
}

function addTags(
  tags: Array<TS.Tag>,
  tagGroup: TS.TagGroup,
  tagGroups: Array<TS.TagGroup>,
) {
  let indexForEditing = tagGroups.findIndex((tg) => tg.uuid === tagGroup.uuid);
  if (indexForEditing >= 0) {
    return setTagLibrary([
      ...tagGroups.slice(0, indexForEditing),
      {
        ...tagGroups[indexForEditing],
        children: tags,
      },
      ...tagGroups.slice(indexForEditing + 1),
    ]);
  }
  return tagGroups;
}

function addTagInt(
  newTag: TS.Tag,
  parentTagGroupUuid: TS.Uuid,
  tagGroups: Array<TS.TagGroup>,
) {
  let indexForEditing = tagGroups.findIndex(
    (tagGroup) => tagGroup.uuid === parentTagGroupUuid,
  );

  if (indexForEditing >= 0) {
    const taggroupTags = tagGroups[indexForEditing].children;
    if (!taggroupTags.some((tag) => tag.title === newTag.title)) {
      return setTagLibrary([
        ...tagGroups.slice(0, indexForEditing),
        {
          ...tagGroups[indexForEditing],
          children: [...taggroupTags, newTag],
        },
        ...tagGroups.slice(indexForEditing + 1),
      ]);
    }
  }
  return tagGroups;
}

function updateTagGroup(
  entry: TS.TagGroup,
  tagGroups: Array<TS.TagGroup>,
): Array<TS.TagGroup> {
  let indexForEditing = tagGroups.findIndex(
    (tagGroup) => tagGroup.uuid === entry.uuid,
  );

  if (indexForEditing >= 0) {
    const modifiedEntry = {
      ...entry,
      ...(!entry.created_date && { created_date: new Date().getTime() }),
      ...(!entry.modified_date && { modified_date: new Date().getTime() }),
    };
    return setTagLibrary([
      ...tagGroups.slice(0, indexForEditing),
      modifiedEntry,
      ...tagGroups.slice(indexForEditing + 1),
    ]);
  }
  return tagGroups;
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
