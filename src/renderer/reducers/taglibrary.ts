/*
/!**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *!/
import {
  immutablySwapItems,
  formatDateTime4Tag,
  extend,
  prepareTagGroupForExport,
} from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { parseNewTags, saveAsTextFile } from '-/services/utils-io';
import versionMeta from '../version.json';
import defaultTagLibrary from './taglibrary-default';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';

export const types = {
  DELETE_ALL: 'DELETE_ALL',
  CREATE_TAGGROUP: 'CREATE_TAGGROUP',
  IMPORT_TAGGROUP: 'IMPORT_TAGGROUP',
  IMPORT_OLD_TAGGROUP: 'IMPORT_OLD_TAGGROUP',
  ADD_TAGGROUP: 'ADD_TAGGROUP',
  MERGE_TAGGROUP: 'MERGE_TAGGROUP',
  REMOVE_TAGGROUP: 'REMOVE_TAGGROUP',
  UPDATE_TAGGROUP: 'UPDATE_TAGGROUP',
  // TOGGLE_TAGGROUP: 'TOGGLE_TAGGROUP',
  ADD_TAGS: 'ADD_TAGS',
  ADD_TAG: 'ADD_TAG',
  // REMOVE_TAG: 'REMOVE_TAG',
  // UPDATE_TAG: 'UPDATE_TAG',
  SORT_TAG_GROUP_UP: 'SORT_TAG_GROUP_UP',
  MOVE_TAG_GROUP: 'MOVE_TAG_GROUP',
  MOVE_TAG_GROUP_UP: 'MOVE_TAG_GROUP_UP',
  MOVE_TAG_GROUP_DOWN: 'MOVE_TAG_GROUP_DOWN',
  EDIT_TAG_COLOR: 'EDIT_TAG_COLOR',
  MOVE_TAG: 'MOVE_TAG',
  CHANGE_TAG_ORDER: 'CHANGE_TAG_ORDER',
};

export default (state: Array<TS.TagGroup> = defaultTagLibrary, action: any) => {
  switch (action.type) {
    case types.DELETE_ALL: {
      return [];
    }
    case types.CREATE_TAGGROUP: {
      return [
        ...state,
        {
          ...action.entry,
          created_date: new Date(),
          modified_date: new Date(),
        },
      ];
    }
    case types.ADD_TAGGROUP: {
      let indexForEditing = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.entry.uuid) {
          indexForEditing = index;
        }
      });
      if (indexForEditing >= 0) {
        return [
          ...state.slice(0, indexForEditing),
          {
            uuid: action.entry.uuid,
            title: action.entry.title,
            children: [
              ...state[indexForEditing].children,
              action.entry.children[0],
            ],
            created_date: new Date(),
            modified_date: new Date(),
          },
          ...state.slice(indexForEditing + 1),
        ];
      }
      return state;
    }
    case types.MERGE_TAGGROUP: {
      const indexForEditing = state.findIndex(
        (obj) => obj.uuid === action.entry.uuid,
      );
      if (indexForEditing >= 0) {
        const tags = [
          ...state[indexForEditing].children,
          ...action.entry.children,
        ];
        tags.splice(0, tags.length - AppConfig.maxCollectedTag);
        return [
          ...state.slice(0, indexForEditing),
          {
            uuid: action.entry.uuid,
            title: action.entry.title,
            children: tags,
            created_date: action.entry.created_date,
            modified_date: new Date(),
          },
          ...state.slice(indexForEditing + 1),
        ];
      }
      return [
        ...state,
        {
          uuid: action.entry.uuid || getUuid(),
          title: action.entry.title,
          color: action.entry.color,
          textcolor: action.entry.textcolor,
          children: action.entry.children,
          created_date: new Date(),
          modified_date: new Date(),
        },
      ];
    }
    case types.UPDATE_TAGGROUP: {
      let indexForEditing = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.entry.uuid) {
          indexForEditing = index;
        }
      });

      if (indexForEditing >= 0) {
        const modifiedEntry = extend(
          { created_date: new Date() },
          action.entry,
          { modified_date: new Date() },
        );
        return [
          ...state.slice(0, indexForEditing),
          modifiedEntry,
          ...state.slice(indexForEditing + 1),
        ];
      }
      return state;
    }
    case types.REMOVE_TAGGROUP: {
      let indexForRemoving = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForRemoving = index;
        }
      });
      if (indexForRemoving >= 0) {
        return [
          ...state.slice(0, indexForRemoving),
          ...state.slice(indexForRemoving + 1),
        ];
      }
      return state;
    }
    case types.ADD_TAGS: {
      let indexForEditing = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.tagGroup.uuid) {
          indexForEditing = index;
        }
      });
      if (indexForEditing >= 0) {
        return [
          ...state.slice(0, indexForEditing),
          {
            ...state[indexForEditing],
            children: action.tags,
          },
          ...state.slice(indexForEditing + 1),
        ];
      }
      return state;
    }
    case types.ADD_TAG: {
      let indexForEditing = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForEditing = index;
        }
      });

      if (indexForEditing >= 0) {
        const taggroupTags = state[indexForEditing].children;
        const newTag = action.tag;
        if (!taggroupTags.some((tag) => tag.title === newTag.title)) {
          return [
            ...state.slice(0, indexForEditing),
            {
              ...state[indexForEditing],
              children: [...taggroupTags, newTag],
            },
            ...state.slice(indexForEditing + 1),
          ];
        }
      }
      return state;
    }
    case types.MOVE_TAG_GROUP_DOWN: {
      let indexForUpdating = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating >= 0 && indexForUpdating < state.length - 1) {
        const secondIndex = indexForUpdating + 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.MOVE_TAG_GROUP: {
      let indexForUpdating = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating > -1 && indexForUpdating !== action.position) {
        const tagGroups = Array.from(state);
        const [removed] = tagGroups.splice(indexForUpdating, 1);
        tagGroups.splice(action.position, 0, removed);
        return tagGroups;
      }
      return state;
    }
    case types.MOVE_TAG_GROUP_UP: {
      let indexForUpdating = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating > 0) {
        const secondIndex = indexForUpdating - 1;
        return immutablySwapItems(state, indexForUpdating, secondIndex);
      }
      return state;
    }
    case types.SORT_TAG_GROUP_UP: {
      let indexForUpdating = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.uuid) {
          indexForUpdating = index;
        }
      });
      if (indexForUpdating >= 0) {
        return [
          ...state.slice(0, indexForUpdating),
          {
            ...state[indexForUpdating],
            children: state[indexForUpdating].children.sort((a, b) =>
              a.title > b.title ? 1 : a.title < b.title ? -1 : 0,
            ),
          },
          ...state.slice(indexForUpdating + 1),
        ];
      }
      return state;
    }
    case types.MOVE_TAG: {
      let tagIndexForRemoving = -1;
      let indexFromGroup = -1;
      let indexToGroup = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.fromTagGroupId) {
          indexFromGroup = index;
        }
        if (tagGroup.uuid === action.toTagGroupId) {
          indexToGroup = index;
        }
      });
      if (indexFromGroup >= 0 && state[indexFromGroup].children) {
        state[indexFromGroup].children.forEach((tag, tagIndex) => {
          if (tag.title === action.tagTitle) {
            tagIndexForRemoving = tagIndex;
          }
          return true;
        });
      }
      if (indexToGroup >= 0 && indexToGroup >= 0 && tagIndexForRemoving >= 0) {
        const newTagLibrary = [...state];
        const tag = { ...state[indexFromGroup].children[tagIndexForRemoving] };
        const found = newTagLibrary[indexToGroup].children.find(
          (t) => t.title === tag.title,
        );
        if (!found) {
          newTagLibrary[indexToGroup].children.push(tag);
          newTagLibrary[indexFromGroup].children = [
            ...newTagLibrary[indexFromGroup].children.slice(
              0,
              tagIndexForRemoving,
            ),
            ...newTagLibrary[indexFromGroup].children.slice(
              tagIndexForRemoving + 1,
            ),
          ];
          return newTagLibrary;
        }
        console.warn(
          'Tag with this title already exists in the target tag group',
        );
      }
      return state;
    }
    case types.CHANGE_TAG_ORDER: {
      let indexFromGroup = -1;
      state.forEach((tagGroup, index) => {
        if (tagGroup.uuid === action.tagGroupUuid) {
          indexFromGroup = index;
        }
      });

      if (indexFromGroup >= 0) {
        const newTagLibrary = [...state];
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#swapping_variables
        [
          newTagLibrary[indexFromGroup].children[action.fromIndex],
          newTagLibrary[indexFromGroup].children[action.toIndex],
        ] = [
          newTagLibrary[indexFromGroup].children[action.toIndex],
          newTagLibrary[indexFromGroup].children[action.fromIndex],
        ];

        return newTagLibrary;
      }
      return state;
    }
    case types.IMPORT_TAGGROUP: {
      const arr = action.replace ? [] : [...state];
      console.log(arr);
      if (action.entries[0] && action.entries[0].key) {
        action.entries.forEach((tagGroup, index) => {
          // migration of old tag groups 2.9 or less in the new version 3.0-present
          // @ts-ignore
          if (tagGroup.key === state.uuid || tagGroup.key !== state.uuid) {
            tagGroup = {
              title: tagGroup.title,
              uuid: tagGroup.key,
              children: tagGroup.children,
            };
            const tagsArr = [];
            tagGroup.children.forEach((tag) => {
              tagsArr.push(tag);
              tagGroup.children = tagsArr;
              arr.push(tagGroup);
            });
          }
        });
      } else {
        action.entries.forEach((tagGroup) => {
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

      return arr;
    }
    default: {
      return state;
    }
  }
};

export const actions = {
  deleteAll: () => ({
    type: types.DELETE_ALL,
  }),
  createTagGroup:
    (entry: TS.TagGroup) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      if (Pro && entry.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === entry.locationId,
        );
        if (location) {
          Pro.MetaOperations.createTagGroup(location.path, entry);
        }
      }
      dispatch(actions.createTagGroupInt(entry));
    },
  createTagGroupInt: (entry: TS.TagGroup) => ({
    type: types.CREATE_TAGGROUP,
    entry,
  }),
  editTagGroup:
    (entry: TS.TagGroup) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      if (Pro && entry.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === entry.locationId,
        );
        if (location) {
          Pro.MetaOperations.editTagGroup(location.path, entry);
        }
      }
      dispatch(actions.editTagGroupInt(entry));
    },
  editTagGroupInt: (entry: TS.TagGroup) => ({
    type: types.UPDATE_TAGGROUP,
    entry,
  }),
  removeTagGroup:
    (parentTagGroupUuid: TS.Uuid) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      const { taglibrary } = getState();
      const tagGroup: TS.TagGroup = taglibrary.find(
        (t) => t.uuid === parentTagGroupUuid,
      );
      if (Pro && tagGroup && tagGroup.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === tagGroup.locationId,
        );
        if (location) {
          Pro.MetaOperations.removeTagGroup(location.path, parentTagGroupUuid);
        }
      }
      dispatch(actions.removeTagGroupInt(parentTagGroupUuid));
    },
  removeTagGroupInt: (parentTagGroupUuid: TS.Uuid) => ({
    type: types.REMOVE_TAGGROUP,
    uuid: parentTagGroupUuid,
  }),
  /!**
   * @deprecated use /services/taglibrary-utils/mergeTagGroup instead
   *!/
  mergeTagGroup:
    (entry: TS.TagGroup) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      if (Pro && entry.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === entry.locationId,
        );
        if (location) {
          Pro.MetaOperations.mergeTagGroup(location.path, entry);
        }
      }
      dispatch(actions.mergeTagGroupInt(entry));
    },
  mergeTagGroupInt: (entry: TS.TagGroup) => ({
    type: types.MERGE_TAGGROUP,
    entry,
  }),
  addTag:
    (tag: any, parentTagGroupUuid: TS.Uuid) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      const { settings, taglibrary } = getState();
      const { tagTextColor, tagBackgroundColor } = settings;

      const tagGroup: TS.TagGroup = taglibrary.find(
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
          textcolor: tag.textcolor || tagTextColor,
          color: tag.color || tagBackgroundColor,
        };
        newTags = [tagObject];
        dispatch(actions.addTagInt(tagObject, parentTagGroupUuid));
      } else {
        const newTagGroup = {
          ...tagGroup,
          color: tagGroup.color ? tagGroup.color : tagBackgroundColor,
          textcolor: tagGroup.textcolor ? tagGroup.textcolor : tagTextColor,
        };
        newTags = parseNewTags(tag, newTagGroup);
        dispatch(actions.addTags(newTags, newTagGroup));
      }

      if (Pro && tagGroup && tagGroup.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === tagGroup.locationId,
        );
        if (location) {
          tagGroup.children = newTags;
          Pro.MetaOperations.editTagGroup(location.path, tagGroup);
        }
      }
    },
  addTags: (tags: Array<TS.Tag>, tagGroup: TS.TagGroup) => ({
    type: types.ADD_TAGS,
    tags,
    tagGroup,
  }),
  addTagInt: (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => ({
    type: types.ADD_TAG,
    tag,
    uuid: parentTagGroupUuid,
  }),
  editTag:
    (tag: TS.Tag, parentTagGroupUuid: TS.Uuid, origTitle: string) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      const { taglibrary } = getState();
      const tagGroup: TS.TagGroup = taglibrary.find(
        (t) => t.uuid === parentTagGroupUuid,
      );
      const newTagGroup = {
        ...tagGroup,
        children: tagGroup.children.map((t) => {
          if (t.title === origTitle) {
            return tag;
          }
          return t;
        }),
      };

      if (Pro && tagGroup && tagGroup.locationId) {
        const { locations } = getState();
        const location: TS.Location = locations.find(
          (l) => l.uuid === tagGroup.locationId,
        );
        if (location) {
          Pro.MetaOperations.editTagGroup(location.path, newTagGroup, true);
        }
      }
      dispatch(actions.editTagGroupInt(newTagGroup));
    },
  deleteTag:
    (tagTitle: string, parentTagGroupUuid: TS.Uuid) =>
    (dispatch: (actions: Object) => void, getState: () => any) => {
      const { taglibrary } = getState();

      const tagGroup: TS.TagGroup = taglibrary.find(
        (t) => t.uuid === parentTagGroupUuid,
      );

      const tagIndexForRemoving = tagGroup.children.findIndex(
        (tag) => tag.title === tagTitle,
      );
      if (tagIndexForRemoving >= 0) {
        const editedTagGroup = {
          ...tagGroup,
          children: [
            ...tagGroup.children.slice(0, tagIndexForRemoving),
            ...tagGroup.children.slice(tagIndexForRemoving + 1),
          ],
        };

        if (Pro && tagGroup.locationId) {
          const { locations } = getState();
          const location: TS.Location = locations.find(
            (l) => l.uuid === tagGroup.locationId,
          );
          if (location) {
            Pro.MetaOperations.editTagGroup(
              location.path,
              editedTagGroup,
              true,
            );
          }
        }
        dispatch(actions.editTagGroupInt(editedTagGroup));
      }
    },
  moveTagGroup: (tagGroupUuid: TS.Uuid, position: number) => ({
    type: types.MOVE_TAG_GROUP,
    uuid: tagGroupUuid,
    position,
  }),
  moveTagGroupUp: (parentTagGroupUuid: TS.Uuid) => ({
    type: types.MOVE_TAG_GROUP_UP,
    uuid: parentTagGroupUuid,
  }),
  moveTagGroupDown: (parentTagGroupUuid: TS.Uuid) => ({
    type: types.MOVE_TAG_GROUP_DOWN,
    uuid: parentTagGroupUuid,
  }),
  sortTagGroup: (parentTagGroupUuid: TS.Uuid) => ({
    type: types.SORT_TAG_GROUP_UP,
    uuid: parentTagGroupUuid,
  }),
  moveTag: (
    tagTitle: string,
    fromTagGroupUuid: TS.Uuid,
    toTagGroupUuid: TS.Uuid,
  ) => ({
    type: types.MOVE_TAG,
    tagTitle,
    fromTagGroupId: fromTagGroupUuid,
    toTagGroupId: toTagGroupUuid,
  }),
  changeTagOrder: (
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number,
  ) => ({
    type: types.CHANGE_TAG_ORDER,
    tagGroupUuid,
    fromIndex,
    toIndex,
  }),
  importTagGroups: (entries: Array<TS.TagGroup>, replace = false) => ({
    type: types.IMPORT_TAGGROUP,
    entries,
    replace,
  }),
};

// Selectors
export const getTagGroups = (state: any) => state.taglibrary;
export const getAllTags = (state: any) => {
  const uniqueTags: TS.Tag[] = [];
  state.taglibrary.forEach((tagGroup) => {
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
};
*/
