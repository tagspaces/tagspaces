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
 */
import OpenLocationCode from 'open-location-code-typescript';
import mgrs from 'mgrs';
import i18n from '../services/i18n';
import {
  actions as AppActions,
  getLocationPersistTagsInSidecarFile
} from './app';
import { actions as TagLibraryActions } from './taglibrary';
import {
  extractFileExtension,
  extractFileName,
  extractTags,
  extractTitle,
  extractContainingDirectoryPath
} from '-/utils/paths';
import {
  loadMetaDataPromise,
  saveMetaDataPromise,
  generateFileName
} from '-/services/utils-io';
import { formatDateTime4Tag, isGeoTag } from '-/utils/misc';
import PlatformIO from '../services/platform-facade';
import { Pro } from '../pro';
import GlobalSearch from '../services/search-index';
import { getPersistTagsInSidecarFile } from './settings';
import { TS } from '-/tagspaces.namespace';

// export const defaultTagLocation = OpenLocationCode.encode(51.48, 0, undefined); // default tag coordinate Greenwich

const persistTagsInSidecarFile = state => {
  const locationPersistTagsInSidecarFile = getLocationPersistTagsInSidecarFile(
    state
  );
  if (locationPersistTagsInSidecarFile !== undefined) {
    return locationPersistTagsInSidecarFile;
  }
  return getPersistTagsInSidecarFile(state);
};

const actions = {
  addTags: (paths: Array<string>, tags: Array<TS.Tag>, updateIndex = true) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { settings, taglibrary } = getState();
    let defaultTagLocation;
    if (settings.geoTaggingFormat.toLowerCase() === 'mgrs') {
      defaultTagLocation = mgrs.forward([0, 51.48]);
    } else {
      defaultTagLocation = OpenLocationCode.encode(51.48, 0, undefined);
    }

    const processedTags = [];
    tags.map(pTag => {
      const tag = { ...pTag };
      tag.type = 'sidecar';
      if (tag.id) {
        delete tag.id;
      }
      if (tag.functionality && tag.functionality.length > 0) {
        delete tag.color;
        delete tag.textcolor;
        delete tag.icon;
        delete tag.description;
        if (tag.functionality === 'geoTagging') {
          if (Pro) {
            tag.path = paths[0]; // todo rethink and remove this!
            // delete tag.functionality;
            tag.title = defaultTagLocation;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            dispatch(
              AppActions.showNotification(
                i18n.t('core:thisFunctionalityIsAvailableInPro')
              )
            );
          }
        } else if (tag.functionality === 'dateTagging') {
          if (Pro) {
            tag.path = paths[0]; // todo rethink and remove this!
            // delete tag.functionality;
            tag.title = formatDateTime4Tag(new Date(), true); // defaultTagDate;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            dispatch(
              AppActions.showNotification(
                i18n.t('core:thisFunctionalityIsAvailableInPro')
              )
            );
          }
        } else {
          tag.title = generateTagValue(tag);
          delete tag.functionality;
          processedTags.push(tag);
        }
      } else {
        processedTags.push(tag);
      }
      return true;
    });

    if (processedTags.length > 0) {
      paths.map(path => {
        dispatch(actions.addTagsToEntry(path, processedTags, updateIndex));
        return true;
      });

      if (settings.addTagsToLibrary) {
        // collecting tags
        // filter existed in tagLibrary
        const uniqueTags = [];
        processedTags.map(tag => {
          if (
            taglibrary.findIndex(
              tagGroup =>
                tagGroup.children.findIndex(obj => obj.title === tag.title) !==
                -1
            ) === -1 &&
            !/^(?:\d+~\d+|\d+)$/.test(tag.title) && // skip adding of tag containing only digits
            !isGeoTag(tag.title) // skip adding of tag containing geo information
          ) {
            uniqueTags.push({
              ...tag,
              color: tag.color || settings.tagBackgroundColor,
              textcolor: tag.textcolor || settings.tagTextColor
            });
          }
          return true;
        });
        if (uniqueTags.length > 0) {
          const tagGroup = {
            uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
            title: i18n.t('core:collectedTags'),
            color: settings.tagBackgroundColor,
            textcolor: settings.tagTextColor,
            children: uniqueTags,
            created_date: new Date().getTime(),
            modified_date: new Date().getTime()
          };
          dispatch(TagLibraryActions.mergeTagGroup(tagGroup));
        }
      }
    }
  },
  addTagsToEntry: (
    path: string,
    tags: Array<TS.Tag>,
    updateIndex = true
  ) => async (dispatch: (actions: Object) => void, getState: () => any) => {
    const { settings } = getState();
    const entryProperties = await PlatformIO.getPropertiesPromise(path);
    let fsEntryMeta;
    try {
      fsEntryMeta = await loadMetaDataPromise(path);
    } catch (error) {
      console.log('No sidecar found ' + error);
    }

    if (!entryProperties.isFile || persistTagsInSidecarFile(getState())) {
      // Handling adding tags in sidecar
      if (fsEntryMeta) {
        const uniqueTags = getNonExistingTags(
          tags,
          extractTags(
            path,
            settings.tagDelimiter,
            PlatformIO.getDirSeparator()
          ),
          fsEntryMeta.tags
        );
        if (uniqueTags.length > 0) {
          const newTags = [...fsEntryMeta.tags, ...uniqueTags];
          const updatedFsEntryMeta = {
            ...fsEntryMeta,
            tags: newTags
          };
          saveMetaDataPromise(path, updatedFsEntryMeta)
            .then(() => {
              dispatch(
                // TODO rethink this updateCurrentDirEntry and not need for KanBan
                AppActions.reflectUpdateSidecarTags(path, newTags, updateIndex)
              );
              const { openedFiles } = getState().app;
              if (openedFiles.find(obj => obj.path === path)) {
                dispatch(
                  AppActions.updateOpenedFile(path, {
                    tags: newTags
                  })
                );
              }
              return true;
            })
            .catch(err => {
              console.warn('Error adding tags for ' + path + ' with ' + err);
              dispatch(
                AppActions.showNotification(
                  i18n.t('core:addingTagsFailed'),
                  'error',
                  true
                )
              );
            });
        }
      } else {
        const newFsEntryMeta = { tags };
        saveMetaDataPromise(path, newFsEntryMeta)
          .then(() => {
            dispatch(
              // TODO rethink this updateCurrentDirEntry and not need for KanBan
              AppActions.reflectUpdateSidecarTags(path, tags, updateIndex)
            );
            const { openedFiles } = getState().app;
            if (openedFiles.find(obj => obj.path === path)) {
              dispatch(
                AppActions.updateOpenedFile(path, { tags, changed: true })
              );
            }
            return true;
          })
          .catch(error => {
            console.warn('Error adding tags for ' + path + ' with ' + error);
            dispatch(
              AppActions.showNotification(
                i18n.t('core:addingTagsFailed'),
                'error',
                true
              )
            );
          });
      }
    } else if (fsEntryMeta) {
      // Handling tags in filename by existing sidecar
      const extractedTags = extractTags(
        path,
        settings.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      const uniqueTags = getNonExistingTags(
        tags,
        extractedTags,
        fsEntryMeta.tags
      );
      if (uniqueTags.length > 0) {
        const fileName = extractFileName(path, PlatformIO.getDirSeparator());
        const containingDirectoryPath = extractContainingDirectoryPath(
          path,
          PlatformIO.getDirSeparator()
        );

        for (let i = 0; i < uniqueTags.length; i += 1) {
          extractedTags.push(uniqueTags[i].title);
        }
        const newFilePath =
          (containingDirectoryPath
            ? containingDirectoryPath + PlatformIO.getDirSeparator()
            : '') +
          generateFileName(fileName, extractedTags, settings.tagDelimiter);
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    } else {
      // Handling tags in filename by no sidecar
      const fileName = extractFileName(path, PlatformIO.getDirSeparator());
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        PlatformIO.getDirSeparator()
      );
      const extractedTags = extractTags(
        path,
        settings.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      for (let i = 0; i < tags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags.indexOf(tags[i].title) < 0) {
          // Adding the new tag
          extractedTags.push(tags[i].title);
        }
      }
      const newFilePath =
        (containingDirectoryPath
          ? containingDirectoryPath + PlatformIO.getDirSeparator()
          : '') +
        generateFileName(fileName, extractedTags, settings.tagDelimiter);
      if (path !== newFilePath) {
        dispatch(AppActions.renameFile(path, newFilePath));
      }
    }

    function getNonExistingTags(
      newTagsArray: Array<TS.Tag>,
      fileTagsArray: Array<string>,
      sideCarTagsArray: Array<TS.Tag>
    ) {
      const newTags = [];
      for (let i = 0; i < newTagsArray.length; i += 1) {
        // check if tag is already in the fileTagsArray
        if (fileTagsArray.indexOf(newTagsArray[i].title) === -1) {
          // check if tag is already in the sideCarTagsArray
          if (
            sideCarTagsArray.findIndex(
              sideCarTag => sideCarTag.title === newTagsArray[i].title
            ) === -1
          ) {
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
  editTagForEntry: (path: string, tag: TS.Tag, newTagTitle?: string) => async (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { settings, taglibrary } = getState();
    if (newTagTitle === undefined) {
      // eslint-disable-next-line no-param-reassign
      newTagTitle = tag.title;
    }
    if (
      tag.functionality === 'geoTagging' ||
      tag.functionality === 'dateTagging'
    ) {
      // Work around solution
      delete tag.functionality;
      const entryProperties = await PlatformIO.getPropertiesPromise(path);
      if (entryProperties.isFile && !persistTagsInSidecarFile(getState())) {
        tag.type = 'plain';
      }
    }
    delete tag.description;
    delete tag.functionality;
    delete tag.path;
    delete tag.id;
    // TODO: Handle adding already added tags
    if (tag.type === 'plain') {
      const fileName = extractFileName(path, PlatformIO.getDirSeparator());
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        PlatformIO.getDirSeparator()
      );
      const extractedTags = extractTags(
        path,
        settings.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      let tagFoundPosition = -1;
      for (let i = 0; i < extractedTags.length; i += 1) {
        // check if tag is already in the tag array
        if (extractedTags[i] === tag.title) {
          extractedTags[i] = newTagTitle.trim();
          tagFoundPosition = i;
        }
      }
      if (tagFoundPosition === -1) {
        // needed for the current implementation of geo tagging
        extractedTags.push(newTagTitle); // tag.title);
      } else if (tag.position !== undefined) {
        // move tag
        const element = extractedTags[tagFoundPosition];
        extractedTags.splice(tagFoundPosition, 1);
        extractedTags.splice(tag.position, 0, element);
      }
      const newFileName = generateFileName(
        fileName,
        extractedTags,
        settings.tagDelimiter
      );
      if (newFileName !== fileName) {
        dispatch(
          AppActions.renameFile(
            path,
            containingDirectoryPath + PlatformIO.getDirSeparator() + newFileName
          )
        );
      }
    } else if (tag.type === 'sidecar') {
      loadMetaDataPromise(path)
        .then(fsEntryMeta => {
          let tagFoundPosition = -1;
          let newTagsArray = fsEntryMeta.tags.map((sidecarTag, index) => {
            if (sidecarTag.title === tag.title) {
              tagFoundPosition = index;
              return {
                ...sidecarTag,
                title: newTagTitle
              };
            }
            return sidecarTag;
          });
          if (tag.position !== undefined && tagFoundPosition > -1) {
            // move tag (reorder)
            const element = newTagsArray[tagFoundPosition];
            newTagsArray.splice(tagFoundPosition, 1);
            newTagsArray.splice(tag.position, 0, element);
          }
          if (tagFoundPosition === -1) {
            // Add mode
            newTagsArray.push({ ...tag, title: newTagTitle });
          }
          // clear duplicates
          newTagsArray = newTagsArray.filter(
            (item, pos, array) =>
              array.findIndex(el => el.title === item.title) === pos
          );
          saveMetaDataPromise(path, {
            ...fsEntryMeta,
            tags: newTagsArray
          })
            .then(() => {
              const { openedFiles } = getState().app;
              if (openedFiles.find(obj => obj.path === path)) {
                dispatch(
                  AppActions.updateOpenedFile(path, {
                    tags: newTagsArray
                  })
                );
              }
              // TODO rethink this updateCurrentDirEntry and not need for KanBan
              dispatch(
                AppActions.reflectUpdateSidecarTags(path, newTagsArray, true)
              );
              return true;
            })
            .catch(err => {
              console.warn('Error adding tags for ' + path + ' with ' + err);
              dispatch(
                AppActions.showNotification(
                  i18n.t('core:addingTagsFailed'),
                  'error',
                  true
                )
              );
            });
          return true;
        })
        .catch(error => {
          // json metadata not exist -create the new one
          console.warn(
            'json metadata not exist create new ' + path + ' with ' + error
          );
          // dispatch(AppActions.showNotification(i18n.t('core:addingTagsFailed'), 'error', true));
          // eslint-disable-next-line no-param-reassign
          tag.title = newTagTitle;
          const fsEntryMeta = { tags: [tag] };
          saveMetaDataPromise(path, fsEntryMeta)
            .then(() => {
              const { openedFiles } = getState().app;
              if (openedFiles.find(obj => obj.path === path)) {
                dispatch(
                  AppActions.updateOpenedFile(path, {
                    tags: fsEntryMeta.tags
                  })
                );
              }
              // TODO rethink this updateCurrentDirEntry and not need for KanBan
              dispatch(
                AppActions.reflectUpdateSidecarTags(path, fsEntryMeta.tags)
              );
              return true;
            })
            .catch(err => {
              console.warn('Error adding tags for ' + path + ' with ' + err);
              dispatch(
                AppActions.showNotification(
                  i18n.t('core:addingTagsFailed'),
                  'error',
                  true
                )
              );
            });
        });
    }

    if (settings.addTagsToLibrary) {
      // collecting tags
      // filter existed in tagLibrary
      const uniqueTags = [];
      if (
        taglibrary.findIndex(
          tagGroup =>
            tagGroup.children.findIndex(obj => obj.title === newTagTitle) !== -1
        ) === -1 &&
        !/^(?:\d+~\d+|\d+)$/.test(newTagTitle) &&
        !isGeoTag(newTagTitle) // skip adding of tag containing only digits or geo tags
      ) {
        uniqueTags.push({
          ...tag,
          title: newTagTitle,
          color: tag.color || settings.tagBackgroundColor,
          textcolor: tag.textcolor || settings.tagTextColor
        });
      }
      if (uniqueTags.length > 0) {
        const tagGroup = {
          uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
          title: i18n.t('core:collectedTags'),
          color: settings.tagBackgroundColor,
          textcolor: settings.tagTextColor,
          children: uniqueTags,
          created_date: new Date().getTime(),
          modified_date: new Date().getTime()
        };
        dispatch(TagLibraryActions.mergeTagGroup(tagGroup));
      }
    }
  },
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => (
    dispatch: (actions: Object) => void
  ) => {
    paths.map(path => {
      dispatch(actions.removeTagsFromEntry(path, tags));
      return true;
    });
  },
  removeTagsFromEntry: (path: string, tags: Array<TS.Tag>) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { settings } = getState();
    const tagTitlesForRemoving = tags.map(tag => tag.title);
    loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        const newTags = [];
        fsEntryMeta.tags.map(sidecarTag => {
          if (!tagTitlesForRemoving.includes(sidecarTag.title)) {
            newTags.push(sidecarTag); // adds only tags which are not in the tags for removing array
          }
          return true;
        });
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: newTags
        };
        saveMetaDataPromise(path, updatedFsEntryMeta)
          .then(() => {
            // TODO rethink this updateCurrentDirEntry and not need for KanBan
            dispatch(AppActions.reflectUpdateSidecarTags(path, newTags));
            const { openedFiles } = getState().app;
            if (openedFiles.find(obj => obj.path === path)) {
              dispatch(
                AppActions.updateOpenedFile(path, {
                  tags: newTags
                })
              );
            }
            if (fsEntryMeta.isFile) {
              removeTagsFromFilename();
            }
            return true;
          })
          .catch(err => {
            console.warn(
              'Removing sidecar tags failed ' + path + ' with ' + err
            );
            dispatch(
              AppActions.showNotification(
                i18n.t('core:removingSidecarTagsFailed'),
                'error',
                true
              )
            );
            if (fsEntryMeta.isFile) {
              removeTagsFromFilename();
            }
          });
        return true;
      })
      .catch(error => {
        console.warn('Error removing tags for ' + path + ' with ' + error);
        // dispatch(AppActions.showNotification(i18n.t('core:removingSidecarTagsFailed'), 'error', true));
        removeTagsFromFilename();
      });

    function removeTagsFromFilename() {
      const extractedTags = extractTags(
        path,
        settings.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      if (extractedTags.length > 0) {
        const fileName = extractFileName(path, PlatformIO.getDirSeparator());
        const containingDirectoryPath = extractContainingDirectoryPath(
          path,
          PlatformIO.getDirSeparator()
        );
        for (let i = 0; i < tagTitlesForRemoving.length; i += 1) {
          const tagLoc = extractedTags.indexOf(tagTitlesForRemoving[i]);
          if (tagLoc < 0) {
            console.log(
              'The tag cannot be removed because it is not part of the file name.'
            );
          } else {
            extractedTags.splice(tagLoc, 1);
          }
        }
        const newFilePath =
          (containingDirectoryPath
            ? containingDirectoryPath + PlatformIO.getDirSeparator()
            : '') +
          generateFileName(fileName, extractedTags, settings.tagDelimiter);
        if (path !== newFilePath) {
          dispatch(AppActions.renameFile(path, newFilePath));
        }
      }
    }
  },
  removeAllTags: (paths: Array<string>) => async (
    dispatch: (action) => Promise<boolean>
  ) => {
    for (const path of paths) {
      // eslint-disable-next-line no-await-in-loop
      const resultMeta = await dispatch(
        actions.removeAllTagsFromMetaData(path)
      );
      // eslint-disable-next-line no-await-in-loop
      const resultName = await dispatch(
        actions.removeAllTagsFromFilename(path)
      );
    }
  },
  removeAllTagsFromFilename: (path: string) => (
    dispatch: (action) => Promise<boolean>,
    getState: () => any
  ): Promise<boolean> => {
    const { settings } = getState();
    // Tags in file name case, check is file
    const extractedTags = extractTags(
      path,
      settings.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
    if (extractedTags.length > 0) {
      const fileTitle = extractTitle(path, false, PlatformIO.getDirSeparator());
      let fileExt = extractFileExtension(path, PlatformIO.getDirSeparator());
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        PlatformIO.getDirSeparator()
      );
      if (fileExt.length > 0) {
        fileExt = '.' + fileExt;
      }
      const newFilePath =
        (containingDirectoryPath
          ? containingDirectoryPath + PlatformIO.getDirSeparator()
          : '') +
        fileTitle +
        fileExt;
      return dispatch(AppActions.renameFile(path, newFilePath));
    }
    return Promise.resolve(true);
  },
  removeAllTagsFromMetaData: (path: string) => (
    dispatch: (action) => void,
    getState: () => any
  ): Promise<boolean> =>
    loadMetaDataPromise(path)
      .then(fsEntryMeta => {
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: []
        };
        return saveMetaDataPromise(path, updatedFsEntryMeta)
          .then(() => {
            // TODO rethink this updateCurrentDirEntry and not need for KanBan
            dispatch(AppActions.reflectUpdateSidecarTags(path, []));
            const { openedFiles } = getState().app;
            if (openedFiles.find(obj => obj.path === path)) {
              dispatch(AppActions.updateOpenedFile(path, { tags: [] }));
            }
            return true;
          })
          .catch(err => {
            console.warn(
              'Removing sidecar tags failed for ' + path + ' with ' + err
            );
            dispatch(
              AppActions.showNotification(
                i18n.t('core:removingTagsInSidecarFileFailed'),
                'error',
                true
              )
            );
            return false;
          });
      })
      .catch(error => {
        console.warn('Could not find meta file for ' + path + ' with ' + error);
        // dispatch(AppActions.showNotification('Adding tags failed', 'error', true));
        return false;
      }),
  // smart tagging -> PRO
  addDateTag: (paths: Array<string>) => () =>
    // dispatch: (actions: Object) => void
    {
      // dispatch(actions.createLocation(location));
    },
  editDateTag: (path: string) => () =>
    // dispatch: (actions: Object) => void
    {
      // dispatch(actions.createLocation(location));
    },
  addGeoTag: (paths: Array<string>) => () =>
    // dispatch: (actions: Object) => void
    {
      // dispatch(actions.createLocation(location));
    },
  editGeoTag: (path: string) => () =>
    // dispatch: (actions: Object) => void
    {
      // dispatch(actions.createLocation(location));
    },
  collectTagsFromLocation: (tagGroup: TS.TagGroup) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { settings } = getState();

    if (GlobalSearch.index.length < 1) {
      dispatch(
        AppActions.showNotification(
          'Please index location first',
          'error',
          true
        )
      );
      return true;
    }

    const uniqueTags = collectTagsFromIndex(
      GlobalSearch.index,
      tagGroup,
      settings
    );
    if (uniqueTags.length > 0) {
      const changedTagGroup = {
        ...tagGroup,
        children: uniqueTags,
        modified_date: new Date().getTime()
      };
      dispatch(TagLibraryActions.mergeTagGroup(changedTagGroup));
    }
  }
};

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

function collectTagsFromIndex(
  locationIndex: any,
  tagGroup: any,
  settings: any
) {
  const uniqueTags = [];
  const defaultTagColor = settings.tagBackgroundColor;
  const defaultTagTextColor = settings.tagTextColor;
  locationIndex.map(entry => {
    if (entry.tags && entry.tags.length > 0) {
      entry.tags.map(tag => {
        if (
          uniqueTags.findIndex(obj => obj.title === tag.title) < 0 && // element not already added
          tagGroup.children.findIndex(obj => obj.title === tag.title) < 0 && // element not already added
          !/^(?:\d+~\d+|\d+)$/.test(tag.title) && // skip adding of tag containing only digits
          !isGeoTag(tag.title) // skip adding of tag containing geo information
        ) {
          uniqueTags.push({
            ...tag,
            color: tag.color || defaultTagColor,
            textcolor: tag.textcolor || defaultTagTextColor
          });
        }
        return true;
      });
    }
    return true;
  });
  return uniqueTags;
}

export default actions;
