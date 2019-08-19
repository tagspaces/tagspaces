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

import uuidv1 from 'uuid';
import i18n from '../services/i18n';
import { actions as AppActions } from './app';
import { actions as TagLibraryActions, type Tag, type TagGroup } from './taglibrary';
import {
  extractFileExtension,
  extractFileName,
  extractTags,
  extractTitle,
  extractContainingDirectoryPath,
} from '../utils/paths';
import {
  loadMetaDataPromise,
  saveMetaDataPromise,
  generateFileName,
} from '../services/utils-io';
import { formatDateTime4Tag, isPlusCode } from '../utils/misc';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import { Pro } from '../pro';
import ocl from '../utils/openlocationcode';

export const defaultTagLocation = ocl.encode(51.48, 0); // default tag coordinate Greenwich

const actions = {
  addTags: (paths: Array<string>, tags: Array<Tag>, updateIndex?: boolean = true) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings, taglibrary } = getState();

    const processedTags = [];
    tags.map((pTag) => {
      const tag = { ...pTag };
      tag.type = 'sidecar';
      if (tag.functionality && tag.functionality.length > 0) {
        if (tag.functionality === 'geoTagging') {
          if (Pro) {
            tag.path = paths[0]; // todo rethink this!
            tag.title = defaultTagLocation;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            dispatch(AppActions.showNotification(i18n.t('core:needProVersion')));
          }
        } else if (tag.functionality === 'dateTagging') {
          if (Pro) {
            tag.path = paths[0];
            tag.title = formatDateTime4Tag(new Date(), true); // defaultTagDate;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            dispatch(AppActions.showNotification(i18n.t('core:needProVersion')));
          }
        } else {
          tag.title = generateTagValue(tag);
          tag.id = uuidv1();
          processedTags.push(tag);
        }
      } else {
        processedTags.push(tag);
      }
      return true;
    });

    if (processedTags.length > 0) {
      paths.map((path) => {
        dispatch(actions.addTagsToEntry(path, processedTags, updateIndex));
        return true;
      });

      if (settings.addTagsToLibrary) { // collecting tags
      // filter existed in tagLibrary
        const uniqueTags = [];
        processedTags.map((tag) => {
          if (
            taglibrary.findIndex(tagGroup => tagGroup.children.findIndex(obj => obj.id === tag.id) !== -1) === -1 &&
          !/^(?:\d+~\d+|\d+)$/.test(tag.title) && // skip adding of tag containing only digits
          !isPlusCode(tag.title) // skip adding of tag containing geo information
          ) {
            uniqueTags.push(tag);
          }
          return true;
        });
        if (uniqueTags.length > 0) {
          const tagGroup = {
            uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
            title: i18n.t('core:collectedTags'),
            expanded: true,
            color: settings.tagBackgroundColor,
            textcolor: settings.tagTextColor,
            children: uniqueTags,
            created_date: new Date(),
            modified_date: new Date()
          };
          dispatch(TagLibraryActions.mergeTagGroup(tagGroup));
        }
      }
    }
  },
  addTagsToEntry: (path: string, tags: Array<Tag>, updateIndex?: boolean = true) => async (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    const entryProperties = await PlatformIO.getPropertiesPromise(path);
    let fsEntryMeta;
    try {
      fsEntryMeta = await loadMetaDataPromise(path);
    } catch (error) {
      console.log('No sidecar found ' + error);
    }

    if (!entryProperties.isFile || settings.persistTagsInSidecarFile) {
      // Handling adding tags in sidecar
      if (fsEntryMeta) {
        const uniqueTags = getNonExistingTags(tags, extractTags(path, settings.tagDelimiter), fsEntryMeta.tags);
        if (uniqueTags.length > 0) {
          const newTags = [
            ...fsEntryMeta.tags,
            ...uniqueTags
          ];
          const updatedFsEntryMeta = {
            ...fsEntryMeta,
            tags: newTags,
          };
          saveMetaDataPromise(path, updatedFsEntryMeta).then(() => {
            dispatch(AppActions.reflectUpdateSidecarTags(path, newTags, updateIndex));
            return true;
          }).catch((err) => {
            console.warn('Error adding tags for ' + path + ' with ' + err);
            dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
          });
        }
      } else {
        const newFsEntryMeta = { tags };
        saveMetaDataPromise(path, newFsEntryMeta).then(() => {
          dispatch(AppActions.reflectUpdateSidecarTags(path, tags, updateIndex));
          return true;
        }).catch(error => {
          console.warn('Error adding tags for ' + path + ' with ' + error);
          dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
        });
      }
    } else if (fsEntryMeta) { // Handling tags in filename by existing sidecar
      const extractedTags = extractTags(path, settings.tagDelimiter);
      const uniqueTags = getNonExistingTags(tags, extractedTags, fsEntryMeta.tags);
      if (uniqueTags.length > 0) {
        const fileName = extractFileName(path);
        const containingDirectoryPath = extractContainingDirectoryPath(path);

        for (let i = 0; i < uniqueTags.length; i += 1) {
          extractedTags.push(uniqueTags[i].title);
        }
        const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + generateFileName(fileName, extractedTags, settings.tagDelimiter);
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    } else { // Handling tags in filename by no sidecar
      const fileName = extractFileName(path);
      const containingDirectoryPath = extractContainingDirectoryPath(path);
      const extractedTags = extractTags(path);
      for (let i = 0; i < tags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags.indexOf(tags[i].title) < 0) {
          // Adding the new tag
          extractedTags.push(tags[i].title);
        }
      }
      const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + generateFileName(fileName, extractedTags, settings.tagDelimiter);
      if (path !== newFilePath) {
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    }

    function getNonExistingTags(newTagsArray: Array<Tag>, fileTagsArray: Array<string>, sideCarTagsArray: Array<Tag>) {
      const newTags = [];
      for (let i = 0; i < newTagsArray.length; i += 1) {
        // check if tag is already in the fileTagsArray
        if (fileTagsArray.indexOf(newTagsArray[i].title) === -1) {
          // check if tag is already in the sideCarTagsArray
          if (sideCarTagsArray.findIndex(sideCarTag => sideCarTag.title === newTagsArray[i].title) === -1) {
            newTags.push(newTagsArray[i]);
          }
        }
      }
      return newTags;
    }
  },
  /**
   * if Tag not exist in meta it will be added see: addMode
   * @param path
   * @param tag
   * @param newTagTitle
   * @returns {Function}
   */
  editTagForEntry: (path: string, tag: Tag, newTagTitle: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings, taglibrary } = getState();
    // TODO: Handle adding already added tags
    if (tag.type === 'plain') {
      const fileName = extractFileName(path);
      const containingDirectoryPath = extractContainingDirectoryPath(path);
      const extractedTags = extractTags(path, settings.tagDelimiter);
      for (let i = 0; i < extractedTags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags[i] === tag.title) {
          extractedTags[i] = newTagTitle.trim();
        }
      }
      const newFileName = generateFileName(fileName, extractedTags, settings.tagDelimiter);
      if (newFileName !== fileName) {
        dispatch(AppActions.renameFile(path, containingDirectoryPath + AppConfig.dirSeparator + newFileName));
      }
    } else if (tag.type === 'sidecar') {
      loadMetaDataPromise(path).then(fsEntryMeta => {
        let addMode = true;
        fsEntryMeta.tags.map((sidecarTag) => {
          if (sidecarTag.title === tag.title) {
            // eslint-disable-next-line no-param-reassign
            sidecarTag.title = newTagTitle;
            addMode = false;
          }
          return true;
        });
        if (addMode) {
          // eslint-disable-next-line no-param-reassign
          tag.title = newTagTitle;
          fsEntryMeta.tags.push(tag);
        }
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: [
            ...fsEntryMeta.tags,
          ],
        };
        saveMetaDataPromise(path, updatedFsEntryMeta).then(() => {
          dispatch(AppActions.reflectUpdateSidecarTags(path, fsEntryMeta.tags));
          return true;
        }).catch((err) => {
          console.warn('Error adding tags for ' + path + ' with ' + err);
          dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
        });
        return true;
      }).catch((error) => { // json metadata not exist -create the new one
        console.warn('json metadata not exist create new ' + path + ' with ' + error);
        // dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
        // eslint-disable-next-line no-param-reassign
        tag.title = newTagTitle;
        const fsEntryMeta = { tags: [tag] };
        saveMetaDataPromise(path, fsEntryMeta).then(() => {
          dispatch(AppActions.reflectUpdateSidecarTags(path, fsEntryMeta.tags));
          return true;
        }).catch((err) => {
          console.warn('Error adding tags for ' + path + ' with ' + err);
          dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
        });
      });
    }

    if (settings.addTagsToLibrary) { // collecting tags
      // filter existed in tagLibrary
      const uniqueTags = [];
      if (
        taglibrary.findIndex(tagGroup => tagGroup.children.findIndex(obj => obj.title === newTagTitle) !== -1) === -1 &&
        !/^(?:\d+~\d+|\d+)$/.test(newTagTitle) &&
        !isPlusCode(newTagTitle)// skip adding of tag containing only digits or geo tags
      ) {
        uniqueTags.push({
          ...tag,
          title: newTagTitle,
          color: settings.tagBackgroundColor,
          textcolor: settings.tagTextColor,
          id: uuidv1()
        });
      }
      if (uniqueTags.length > 0) {
        const tagGroup = {
          uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
          title: i18n.t('core:collectedTags'),
          expanded: true,
          color: settings.tagBackgroundColor,
          textcolor: settings.tagTextColor,
          children: uniqueTags,
          created_date: new Date(),
          modified_date: new Date()
        };
        dispatch(TagLibraryActions.mergeTagGroup(tagGroup));
      }
    }
  },
  removeTags: (paths: Array<string>, tags: Array<Tag>) => (
    dispatch: (actions: Object) => void,
  ) => {
    paths.map((path) => {
      dispatch(actions.removeTagsFromEntry(path, tags));
      return true;
    });
  },
  removeTagsFromEntry: (path: string, tags: Array<Tag>) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    const sidecarTags = [];
    let tagsInFilenameAvailable = false;
    tags.map(tag => {
      if (tag.type === 'sidecar') {
        sidecarTags.push(tag.title);
      } else if (tag.type === 'plain') {
        tagsInFilenameAvailable = true;
      }
      return true;
    });
    loadMetaDataPromise(path).then(fsEntryMeta => {
      const newTags = [];
      fsEntryMeta.tags.map((sidecarTag) => {
        if (!sidecarTags.includes(sidecarTag.title)) {
          newTags.push(sidecarTag); // adds only tags which are not in the tags for removing array
        }
        return true;
      });
      const updatedFsEntryMeta = {
        ...fsEntryMeta,
        tags: newTags,
      };
      saveMetaDataPromise(path, updatedFsEntryMeta).then(() => {
        dispatch(AppActions.reflectUpdateSidecarTags(path, newTags));
        removeTagsFromFilename();
        return true;
      }).catch((err) => {
        console.warn('Removing sidecar tags failed ' + path + ' with ' + err);
        dispatch(AppActions.showNotification(i18n.t('core:removingSidecarTagsFailed'), 'error', true));
        removeTagsFromFilename();
      });
      return true;
    }).catch((error) => {
      console.warn('Error adding tags for ' + path + ' with ' + error);
      // dispatch(AppActions.showNotification(i18n.t('core:removingSidecarTagsFailed'), 'error', true));
      removeTagsFromFilename();
    });

    function removeTagsFromFilename() {
      if (!tagsInFilenameAvailable) {
        return;
      }
      const extractedTags = extractTags(path, settings.tagDelimiter);
      if (extractedTags.length > 0) {
        const fileName = extractFileName(path);
        const containingDirectoryPath = extractContainingDirectoryPath(path);
        for (let i = 0; i < tags.length; i += 1) {
          const tagLoc = extractedTags.indexOf(tags[i].title);
          if (tagLoc < 0) {
            console.log('The tag cannot be removed because it is not part of the file name.');
          } else {
            extractedTags.splice(tagLoc, 1);
          }
        }
        const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + generateFileName(fileName, extractedTags, settings.tagDelimiter);
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    }
  },
  removeAllTags: (paths: Array<string>) => (
    dispatch: (actions: Object) => void,
  ) => {
    paths.map((path) => {
      dispatch(actions.removeAllTagsFromEntry(path));
      return true;
    });
  },
  removeAllTagsFromEntry: (path: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    loadMetaDataPromise(path).then(fsEntryMeta => {
      const updatedFsEntryMeta = {
        ...fsEntryMeta,
        tags: [],
      };
      saveMetaDataPromise(path, updatedFsEntryMeta).then(() => {
        dispatch(AppActions.reflectUpdateSidecarTags(path, []));
        removeAllTagsFromFilename();
        return true;
      }).catch((err) => {
        console.warn('Removing sidecar tags failed for ' + path + ' with ' + err);
        dispatch(AppActions.showNotification(i18n.t('core:removingTagsInSidecarFileFailed'), 'error', true));
        removeAllTagsFromFilename();
      });
      return true;
    }).catch((error) => {
      console.warn('Could not find meta file for ' + path + ' with ' + error);
      // dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
      removeAllTagsFromFilename();
    });

    function removeAllTagsFromFilename() {
      // Tags in file name case, check is file
      const extractedTags = extractTags(path, settings.tagDelimiter);
      if (extractedTags.length > 0) {
        const fileTitle = extractTitle(path);
        let fileExt = extractFileExtension(path);
        const containingDirectoryPath = extractContainingDirectoryPath(path);
        if (fileExt.length > 0) {
          fileExt = '.' + fileExt;
        }
        const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + fileTitle + fileExt;
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    }
  },
  changeTagOrder: (path: string, tag: Tag, direction: 'prev' | 'next' | 'first') => (
    // dispatch: (actions: Object) => void
  ) => {
    /*
    console.log('Moves the location of tag in the file name: ' + filePath);
    var fileName = extractFileName(filePath);
    var containingDirectoryPath = extractContainingDirectoryPath(filePath);
    var extractedTags = extractTags(filePath);
    if (extractedTags.indexOf(tagName) < 0) {
      showAlertDialog("The tag you are trying to move is not part of the file name and that's why it cannot be moved.", $.i18n.t("ns.common:warning"));
      return;
    }
    var tmpTag;
    for (var i = 0; i < extractedTags.length; i++) {
      // check if tag is already in the tag array
      if (extractedTags[i] === tagName) {
        if (direction === 'prev' && i > 0) {
          tmpTag = extractedTags[i - 1];
          extractedTags[i - 1] = extractedTags[i];
          extractedTags[i] = tmpTag;
          break;
        } else if (direction === 'next' && i < extractedTags.length - 1) {
          tmpTag = extractedTags[i];
          extractedTags[i] = extractedTags[i + 1];
          extractedTags[i + 1] = tmpTag;
          break;
        } else if (direction === 'first' && i > 0) {
          tmpTag = extractedTags[i];
          extractedTags[i] = extractedTags[0];
          extractedTags[0] = tmpTag;
          break;
        }
      }
    }
    var newFileName = generateFileName(fileName, extractedTags);
    renameFile(filePath, containingDirectoryPath + AppConfig.dirSeparator + newFileName); */
  },
  // smart tagging -> PRO
  addDateTag: (paths: Array<string>) => (
    // dispatch: (actions: Object) => void
  ) => {
    // dispatch(actions.createLocation(location));
  },
  editDateTag: (path: string) => (
    // dispatch: (actions: Object) => void
  ) => {
    // dispatch(actions.createLocation(location));
  },
  addGeoTag: (paths: Array<string>) => (
    // dispatch: (actions: Object) => void
  ) => {
    // dispatch(actions.createLocation(location));
  },
  editGeoTag: (path: string) => (
    // dispatch: (actions: Object) => void
  ) => {
    // dispatch(actions.createLocation(location));
  },
  collectTagsFromLocation: (tagGroup: TagGroup) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { locationIndex, settings } = getState();

    if (!Pro || !Pro.Indexer || !Pro.Indexer.collectTagsFromIndex) {
      dispatch(AppActions.showNotification(i18n.t('core:needProVersion'), 'error', true));
      return true;
    }

    if (locationIndex.currentDirectoryIndex.length < 1) {
      dispatch(AppActions.showNotification('Please index location first', 'error', true));
      return true;
    }

    const uniqueTags = Pro.Indexer.collectTagsFromIndex(locationIndex, tagGroup, settings);
    if (uniqueTags.length > 0) {
      const changedTagGroup = {
        ...tagGroup,
        children: uniqueTags,
        modified_date: new Date()
      };
      dispatch(TagLibraryActions.mergeTagGroup(changedTagGroup));
    }
  },
};

function handleSmartTag(smarttagFunction: string) {
  switch (smarttagFunction) {
  case 'today':
    message = data.title ? data.title : '';
    if (data.message) {
      message = message + ': ' + data.message;
    }
    this.props.showNotification(message, NotificationTypes.default);
    break;
  default:
    console.log('Not recognized messaging command: ' + msg);
    break;
  }
}

function generateTagValue(tag) {
  let tagTitle = tag.functionality;
  switch (tag.functionality) {
  case 'today': {
    tagTitle = formatDateTime4Tag(new Date(), false);
    break;
  }
  case 'tomorrow': {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    tagTitle = formatDateTime4Tag(d, false);
    break;
  }
  case 'yesterday': {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    tagTitle = formatDateTime4Tag(d, false);
    break;
  }
  case 'currentMonth': {
    let cMonth = '' + (new Date().getMonth() + 1);
    if (cMonth.length === 1) {
      cMonth = '0' + cMonth;
    }
    tagTitle = '' + new Date().getFullYear() + cMonth;
    break;
  }
  case 'currentYear': {
    tagTitle = '' + new Date().getFullYear();
    break;
  }
  case 'now': {
    tagTitle = formatDateTime4Tag(new Date(), true);
    break;
  }
  default: {
    break;
  }
  }
  return tagTitle;
}

export default actions;
