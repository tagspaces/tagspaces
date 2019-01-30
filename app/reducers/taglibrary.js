/**
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
 * @flow
 */

// import AppConfig from '../config';
import uuidv1 from 'uuid';
import { immutablySwapItems, formatDateTime4Tag, extend } from '../utils/misc';
import { saveAsTextFile } from '../services/utils-io';
import versionMeta from '../version.json';
import defaultTagLibrary from './taglibrary-default';
// import AppConfig from '../config';

export const types = {
  CREATE_TAGGROUP: 'CREATE_TAGGROUP',
  IMPORT_TAGGROUP: 'IMPORT_TAGGROUP',
  IMPORT_OLD_TAGGROUP: 'IMPORT_OLD_TAGGROUP',
  ADD_TAGGROUP: 'ADD_TAGGROUP',
  MERGE_TAGGROUP: 'MERGE_TAGGROUP',
  REMOVE_TAGGROUP: 'REMOVE_TAGGROUP',
  UPDATE_TAGGROUP: 'UPDATE_TAGGROUP',
  TOGGLE_TAGGROUP: 'TOGGLE_TAGGROUP',
  ADD_TAG: 'ADD_TAG',
  REMOVE_TAG: 'REMOVE_TAG',
  UPDATE_TAG: 'UPDATE_TAG',
  SORT_TAG_GROUP_UP: 'SORT_TAG_GROUP_UP',
  MOVE_TAG_GROUP_UP: 'MOVE_TAG_GROUP_UP',
  MOVE_TAG_GROUP_DOWN: 'MOVE_TAG_GROUP_DOWN',
  EDIT_TAG_COLOR: 'EDIT_TAG_COLOR',
  MOVE_TAG: 'MOVE_TAG',
};

export type Uuid = string;

export type Tag = {
  title: string,
  type: 'plain' | 'sidecar' | 'smart', // smart should be eventually removed from this list, functionality should be enough
  id?: Uuid,
  icon?: string,
  description?: string,
  style?: string,
  functionality?: string,
  keyBinding?: string,
  color?: string,
  textcolor?: string
};

export type TagGroup = {
  uuid: Uuid,
  title: string,
  expanded: boolean,
  description?: string,
  categoryId?: string,
  color?: string,
  textcolor?: string,
  children?: Array<Tag>
};

export default (state: Array<TagGroup> = defaultTagLibrary, action: Object) => {
  switch (action.type) {
  case types.CREATE_TAGGROUP: {
    return [...state, {
      uuid: uuidv1(),
      title: action.entry.title,
      expanded: action.entry.expanded,
      color: action.entry.color,
      textcolor: action.entry.textcolor,
      children: [],
      created_date: new Date(),
      modified_date: new Date()
    }
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
          expanded: action.entry.expanded,
          children: [...state[indexForEditing].children, action.entry.children[0]],
          created_date: new Date(),
          modified_date: new Date()
        },
        ...state.slice(indexForEditing + 1)
      ];
    }
    return state;
  }
  case types.MERGE_TAGGROUP: {
    const indexForEditing = state.findIndex(obj => obj.uuid === action.entry.uuid);
    if (indexForEditing >= 0) {
      return [
        ...state.slice(0, indexForEditing),
        {
          uuid: action.entry.uuid,
          title: action.entry.title,
          expanded: action.entry.expanded,
          children: [...state[indexForEditing].children, ...action.entry.children],
          created_date: action.entry.created_date,
          modified_date: new Date()
        },
        ...state.slice(indexForEditing + 1)
      ];
    }
    return [...state, {
      uuid: action.entry.uuid || uuidv1(),
      title: action.entry.title,
      expanded: action.entry.expanded,
      color: action.entry.color,
      textcolor: action.entry.textcolor,
      children: action.entry.children,
      created_date: new Date(),
      modified_date: new Date()
    }
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
      const modifiedEntry = extend({ created_date: new Date() }, action.entry, { modified_date: new Date() });
      return [
        ...state.slice(0, indexForEditing),
        modifiedEntry,
        ...state.slice(indexForEditing + 1)
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
        ...state.slice(indexForRemoving + 1)
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
      const tags = action.tag.split(',');
      const children = state[indexForEditing].children;
      return [
        ...state.slice(0, indexForEditing),
        {
          ...state[indexForEditing],
          children: children.concat(tags.map((tagTitle) => ({
            id: uuidv1(),
            type: children.length > 0 ? children[0].type : 'sidecar',
            title: tagTitle.trim(),
            functionality: '',
            description: '',
            icon: '',
            color: state[indexForEditing].color ? state[indexForEditing].color : '', // default color
            textcolor: state[indexForEditing].textcolor ? state[indexForEditing].textcolor : '', // default color
            style: children.length > 0 ? children[0].style : '',
            created_date: new Date(),
            modified_date: new Date()
          })))
        },
        ...state.slice(indexForEditing + 1)
      ];
    }
    return state;
  }
  case types.UPDATE_TAG: {
    let tagIndexForUpdating = -1;
    let indexForUpdating = -1;
    state.forEach((tagGroup, index) => {
      if (tagGroup.uuid === action.uuid) {
        indexForUpdating = index;
      }
      tagGroup.children.forEach((tag, tagIndex) => {
        if (tag.id === action.entry.id) {
          tagIndexForUpdating = tagIndex;
        }
      });
    });
    if (tagIndexForUpdating >= 0) {
      const modifiedEntry = extend({ created_date: new Date() }, action.entry, { modified_date: new Date() });
      return [
        ...state.slice(0, indexForUpdating),
        {
          ...state[indexForUpdating],
          children: [
            ...state[indexForUpdating].children.slice(0, tagIndexForUpdating),
            modifiedEntry,
            ...state[indexForUpdating].children.slice(tagIndexForUpdating + 1)
          ]
        },
        ...state.slice(indexForUpdating + 1)
      ];
    }
    return state;
  }
  case types.REMOVE_TAG: {
    let tagIndexForRemoving = -1;
    let indexForEditing = -1;
    state.forEach((tagGroup, index) => {
      if (tagGroup.uuid === action.uuid) {
        indexForEditing = index;
      }
      tagGroup.children.forEach((tag, tagIndex) => {
        if (tag.id === action.tagID) {
          tagIndexForRemoving = tagIndex;
        }
      });
    });
    if (tagIndexForRemoving >= 0) {
      return [
        ...state.slice(0, indexForEditing),
        {
          ...state[indexForEditing],
          children: [
            ...state[indexForEditing].children.slice(0, tagIndexForRemoving),
            ...state[indexForEditing].children.slice(tagIndexForRemoving + 1)
          ]
        },
        ...state.slice(indexForEditing + 1)
      ];
    }
    return state;
  }
  case types.TOGGLE_TAGGROUP: {
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
          expanded: !action.expanded
        },
        ...state.slice(indexForUpdating + 1)
      ];
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
    if (indexForUpdating >= 0 && indexForUpdating < (state.length - 1)) {
      const secondIndex = indexForUpdating + 1;
      return immutablySwapItems(state, indexForUpdating, secondIndex);
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
          children: state[indexForUpdating].children.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0))
        },
        ...state.slice(indexForUpdating + 1)
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
        if (tag.id === action.tagID) {
          tagIndexForRemoving = tagIndex;
        }
        return true;
      });
    }
    if (indexToGroup >= 0 && indexToGroup >= 0 && tagIndexForRemoving >= 0) {
      const newTagLibrary = [...state];
      const tag = { ...state[indexFromGroup].children[tagIndexForRemoving] };
      newTagLibrary[indexToGroup].children.push(tag);
      newTagLibrary[indexFromGroup].children = [
        ...newTagLibrary[indexFromGroup].children.slice(0, tagIndexForRemoving),
        ...newTagLibrary[indexFromGroup].children.slice(tagIndexForRemoving + 1)
      ];
      return newTagLibrary;
    }
    return state;
  }
  case types.IMPORT_TAGGROUP: {
    const arr = [...state];
    console.log(arr);
    if (action.entry[0].key) {
      action.entry.forEach((tagGroup, index) => {
        // migration of old tag groups 2.9 or less in the new version 3.0-present
        if (tagGroup.key === state.uuid || tagGroup.key !== state.uuid) {
          tagGroup = {
            title: tagGroup.title,
            uuid: tagGroup.key,
            expanded: true,
            children: tagGroup.children
          };
          const tagsArr = [];
          tagGroup.children.forEach((tag) => {
            if (!tag.id) {
              tag = {
                id: uuidv1(),
                type: tag.type,
                title: tag.title,
                functionality: tag.title,
                color: tag.color,
                textcolor: tag.textcolor,
                description: tag.description,
                icon: tag.icon,
                style: tag.style
              };
              tagsArr.push(tag);
            }
            tagGroup.children = tagsArr;
            arr.push(tagGroup);
          });
        }
      });
    } else {
      action.entry.forEach((tagGroup) => {
        const index = state.findIndex(obj => obj.uuid === tagGroup.uuid);
        if (index > -1) {
          tagGroup.children.forEach((tag) => {
            const stateTag = state[index].children.find(obj => obj.id === tag.id);
            if (stateTag === undefined) {
              arr[index].children.push(tag);
            }
          });
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
  createTagGroup: (entry: TagGroup) => ({ type: types.CREATE_TAGGROUP, entry }),
  editTagGroup: (entry: TagGroup) => ({ type: types.UPDATE_TAGGROUP, entry }),
  removeTagGroup: (parentTagGroupUuid: Uuid) => ({ type: types.REMOVE_TAGGROUP, uuid: parentTagGroupUuid }),
  toggleTagGroup: (expanded: boolean, parentTagGroupUuid: Uuid) => ({ type: types.TOGGLE_TAGGROUP, expanded, uuid: parentTagGroupUuid }),
  addTagGroup: (entry: TagGroup) => ({ type: types.ADD_TAGGROUP, entry }),
  mergeTagGroup: (entry: TagGroup) => ({ type: types.MERGE_TAGGROUP, entry }),
  addTag: (tag: string, parentTagGroupUuid: Uuid) => {
    console.log('INSIDE ADD TAG');
    console.log(tag, parentTagGroupUuid);
    return { type: types.ADD_TAG, tag, uuid: parentTagGroupUuid };
  },
  editTag: (entry: Tag, parentTagGroupUuid: Uuid) => ({ type: types.UPDATE_TAG, entry, uuid: parentTagGroupUuid }),
  deleteTag: (tagID: string, parentTagGroupUuid: Uuid) => ({ type: types.REMOVE_TAG, tagID, uuid: parentTagGroupUuid }),
  moveTagGroupUp: (parentTagGroupUuid: Uuid) => ({ type: types.MOVE_TAG_GROUP_UP, uuid: parentTagGroupUuid }),
  moveTagGroupDown: (parentTagGroupUuid: Uuid) => ({ type: types.MOVE_TAG_GROUP_DOWN, uuid: parentTagGroupUuid }),
  sortTagGroup: (parentTagGroupUuid: Uuid) => ({ type: types.SORT_TAG_GROUP_UP, uuid: parentTagGroupUuid }),
  moveTag: (tagID: string, fromTagGroupUuid: Uuid, toTagGroupUuid: Uuid) =>
    ({ type: types.MOVE_TAG, tagID, fromTagGroupId: fromTagGroupUuid, toTagGroupId: toTagGroupUuid }),
  importTagGroups: (entry) => ({ type: types.IMPORT_TAGGROUP, entry }),
  exportTagGroups: (entry: Array<Object>) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    const tagLibrary = entry;
    const jsonFormat = '{ "appName": "' + versionMeta.name +
      '", "appVersion": "' + versionMeta.version +
      '", "settingsVersion": ' + settings.settingsVersion +
      ', "tagGroups": ';
    const getAllTags = [];
    tagLibrary.forEach((value) => {
      getAllTags.push(value);
    });

    const blob = new Blob([jsonFormat + JSON.stringify(getAllTags) + '}'], {
      type: 'application/json'
    });
    const dateTimeTag = formatDateTime4Tag(new Date(), true);
    saveAsTextFile(blob, 'tag-library [tagspaces ' + dateTimeTag + '].json');
    console.log('Tag library exported...');
  }
};

// Selectors
export const getTagGroups = (state: Object) => state.taglibrary;
export const getAllTags = (state: Object) => {
  const allTags: Array<Tag> = [];
  state.taglibrary.forEach(tagGroup => {
    tagGroup.children.forEach(tag => {
      allTags.push(tag);
    });
  });
  return allTags.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0));
};

export const getTagColors = (state: Object, tagTitle: string) => {
  const tagColors = {
    textcolor: state.settings.tagTextColor,
    color: state.settings.tagBackgroundColor
  };
  state.taglibrary.forEach(tagGroup => {
    tagGroup.children.forEach((tag: Tag) => {
      if (tag.title === tagTitle) {
        tagColors.textcolor = tag.textcolor;
        tagColors.color = tag.color;
      }
    });
  });
  return tagColors;
};
