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

import i18n from '../services/i18n';
import { actions as AppActions } from './app';
import { actions as TagLibraryActions, type Tag } from './taglibrary';
import uuidv1 from 'uuid';
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
import { formatDateTime4Tag } from '../utils/misc';
import AppConfig from '../config';

const actions = {
  addTags: (paths: Array<string>, tags: Array<Tag>) => (
    dispatch: (actions: Object) => void,
  ) => {
    paths.map((path) => {
      dispatch(actions.addTagsToEntry(path, tags));
      return true;
    });
  },
  addTagsToEntry: (path: string, tags: Array<Tag>) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings, taglibrary } = getState();
    const processedTags = [];
    tags.map((pTag) => {
      const tag = { ...pTag };
      if (tag.functionality && tag.functionality.length > 0) {
        tag.title = generateTagValue(tag.functionality);
        tag.id = uuidv1();
      }
      tag.type = settings.persistTagsInSidecarFile ? 'sidecar' : 'plain';
      processedTags.push(tag);
      return true;
    });

    if (settings.addTagsToLibrary) {
      // filter existed in tagLibrary
      const uniqueTags = [];
      processedTags.map((tag) => {
        if (taglibrary.findIndex(tagGroup => tagGroup.children.findIndex(obj => obj.id === tag.id) !== -1) === -1 && !/^(?:\d+~\d+|\d+)$/.test(tag.title)) {
          uniqueTags.push(tag);
        }
        return true;
      });
      if (uniqueTags.length > 0) {
        const tagGroup = {
          uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
          title: i18n.t('core:collectedTags'),
          expanded: true,
          color: '#00ff00',
          textcolor: '#000',
          children: uniqueTags,
          created_date: new Date(),
          modified_date: new Date()
        };
        dispatch(TagLibraryActions.mergeTagGroup(tagGroup));
      }
    }

    // TODO: Handle adding already added tags
    if (settings.persistTagsInSidecarFile) {
      // Handling adding tags in sidecar
      loadMetaDataPromise(path).then(fsEntryMeta => {
        const newTags = [
          ...fsEntryMeta.tags,
          ...processedTags
        ];
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: newTags,
        };
        saveMetaDataPromise(path, updatedFsEntryMeta).then(() => {
          dispatch(AppActions.reflectUpdateSidecarTags(path, newTags));
          return true;
        }).catch((err) => {
          console.warn('Error adding tags for ' + path + ' with ' + err);
          dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
        });
        return true;
      }).catch(() => {
        const newFsEntryMeta = {
          processedTags
        };
        saveMetaDataPromise(path, newFsEntryMeta).then(() => {
          dispatch(AppActions.reflectUpdateSidecarTags(path, processedTags));
          return true;
        }).catch(error => {
          console.warn('Error adding tags for ' + path + ' with ' + error);
          dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
        });
      });
    } else {
      const fileName = extractFileName(path);
      const containingDirectoryPath = extractContainingDirectoryPath(path);
      const extractedTags = extractTags(path);
      for (let i = 0; i < processedTags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags.indexOf(processedTags[i].title) < 0) {
          // Adding the new tag
          extractedTags.push(processedTags[i].title);
        }
      }
      const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + generateFileName(fileName, extractedTags);
      dispatch(AppActions.renameFile(path, newFilePath));
    }
    // dispatch collectRecentTags(tags);
  },
  editTagForEntry: (path: string, tag: Tag, newTagTitle: string) => (
    dispatch: (actions: Object) => void
  ) => {
    // TODO: Handle adding already added tags
    if (tag.type === 'plain') {
      const fileName = extractFileName(path);
      const containingDirectoryPath = extractContainingDirectoryPath(path);
      const extractedTags = extractTags(path);
      for (let i = 0; i < extractedTags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags[i] === tag.title) {
          extractedTags[i] = newTagTitle.trim();
        }
      }
      const newFileName = generateFileName(fileName, extractedTags);
      if (newFileName !== fileName) {
        dispatch(AppActions.renameFile(path, containingDirectoryPath + AppConfig.dirSeparator + newFileName));
      }
    } else if (tag.type === 'sidecar') {
      loadMetaDataPromise(path).then(fsEntryMeta => {
        fsEntryMeta.tags.map((sidecarTag) => {
          if (sidecarTag.title === tag.title) {
            sidecarTag.title = newTagTitle;
          }
          return true;
        });
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
          dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
        });
        return true;
      }).catch((error) => {
        console.warn('Error adding tags for ' + path + ' with ' + error);
        dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
      });
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
  ) => {
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
        dispatch(AppActions.showNotification('Removing sidecar tags failed', 'error', true));
        removeTagsFromFilename();
      });
      return true;
    }).catch((error) => {
      console.warn('Error adding tags for ' + path + ' with ' + error);
      // dispatch(AppActions.showNotification('Removing sidecar tags failed', 'error', true));
      removeTagsFromFilename();
    });

    function removeTagsFromFilename() {
      if (!tagsInFilenameAvailable) {
        return;
      }
      const extractedTags = extractTags(path);
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
        const newFilePath = containingDirectoryPath + AppConfig.dirSeparator + generateFileName(fileName, extractedTags);
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
  ) => {
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
        dispatch(AppActions.showNotification('Removing tags in sidecar file failed', 'error', true));
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
      const extractedTags = extractTags(path);
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

function generateTagValue(smarttagFunction: string) {
  let tagTitle = smarttagFunction;
  switch (smarttagFunction) {
  /* case 'geoTagging': {
      $('#viewContainers').on('drop dragend', function(event) {
        if (TSCORE.PRO && TSCORE.selectedTag === 'geo-tag') {
          TSCORE.UI.showTagEditDialog(true); // true start the dialog in add mode
        } else if (!TSCORE.PRO && TSCORE.selectedTag === 'geo-tag') {
          TSCORE.showAlertDialog($.i18n.t("ns.common:needProVersion"), $.i18n.t("ns.common:geoTaggingNotPossible"));
        }
      });
      break;
    } */
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
