/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import mgrs from 'mgrs';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { TS } from '-/tagspaces.namespace';
import OpenLocationCode from 'open-location-code-typescript';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { getTagLibrary, mergeTagGroup } from '-/services/taglibrary-utils';
import { isGeoTag } from '-/utils/geo';
import {
  getAddTagsToLibrary,
  getGeoTaggingFormat,
  getPrefixTagContainer,
  getTagColor,
  getTagDelimiter,
  getTagTextColor,
} from '-/reducers/settings';
import PlatformIO from '-/services/platform-facade';
import {
  generateFileName,
  getAllPropertiesPromise,
  loadDirMetaDataPromise,
  loadFileMetaDataPromise,
  loadMetaDataPromise,
  saveMetaDataPromise,
} from '-/services/utils-io';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractTags,
} from '@tagspaces/tagspaces-common/paths';
import { getLocations } from '-/reducers/locations';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type extractOptions = {
  EXIFGeo?: boolean;
  EXIFDateTime?: boolean;
  IPTCDescription?: boolean;
  IPTCTags?: boolean;
};

type TaggingActionsContextData = {
  extractContent: (options?: extractOptions) => Promise<boolean>;
  addFilesTags: (files: { [filePath: string]: TS.Tag[] }) => Promise<boolean>;
  addTags: (paths: Array<string>, tags: Array<TS.Tag>) => Promise<boolean>;
  addTagsToEntry: (
    path: string,
    tags: Array<TS.Tag>,
    reflect?: boolean,
  ) => Promise<string>;
  editTagForEntry: (path: string, tag: TS.Tag, newTagTitle?: string) => void;
  removeTags: (paths: Array<string>, tags?: Array<TS.Tag>) => Promise<boolean>;
  removeTagsFromEntry: (path: string, tags?: Array<TS.Tag>) => Promise<string>;
  removeAllTags: (paths: Array<string>) => Promise<boolean>;
  collectTagsFromLocation: (tagGroup: TS.TagGroup) => void;
};

export const TaggingActionsContext = createContext<TaggingActionsContextData>({
  extractContent: undefined,
  addFilesTags: undefined,
  addTags: undefined,
  addTagsToEntry: undefined,
  editTagForEntry: undefined,
  removeTags: undefined,
  removeTagsFromEntry: undefined,
  removeAllTags: undefined,
  collectTagsFromLocation: undefined,
});

export type TaggingActionsContextProviderProps = {
  children: React.ReactNode;
};

export const TaggingActionsContextProvider = ({
  children,
}: TaggingActionsContextProviderProps) => {
  const { t } = useTranslation();
  const { persistTagsInSidecarFile } = useCurrentLocationContext();
  const { currentDirectoryEntries } = useDirectoryContentContext();
  const { getIndex } = useLocationIndexContext();
  const { renameFile } = useIOActionsContext();
  const { reflectUpdateMeta, setReflectActions } = useEditedEntryContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const dispatch: AppDispatch = useDispatch();
  const geoTaggingFormat = useSelector(getGeoTaggingFormat);
  const addTagsToLibrary = useSelector(getAddTagsToLibrary);
  const tagBackgroundColor: string = useSelector(getTagColor);
  const tagTextColor: string = useSelector(getTagTextColor);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const prefixTagContainer: boolean = useSelector(getPrefixTagContainer);
  const locations: TS.Location[] = useSelector(getLocations);

  function extractContent(
    options: extractOptions = {
      EXIFGeo: true,
      EXIFDateTime: true,
      IPTCDescription: true,
      IPTCTags: true,
    },
  ): Promise<boolean> {
    if (!Pro || !Pro.ContentExtractor) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return Promise.resolve(false);
    }
    showNotification('Extracting content...', 'info', false);
    return Pro.ContentExtractor.extractContent(
      currentDirectoryEntries,
      options,
    ).then((extracted: { [filePath: string]: TS.Tag[] }) => {
      hideNotifications();
      return addFilesTags(extracted);
    });
  }

  function addTagsToFilePath(path: string, tags: string[]) {
    if (tags && tags.length > 0) {
      const extractedTags: string[] = extractTags(
        path,
        tagDelimiter,
        PlatformIO.getDirSeparator(),
      );
      const uniqueTags = tags.filter(
        (tag) => !extractedTags.some((tagName) => tagName === tag),
      );
      const fileName = extractFileName(path, PlatformIO.getDirSeparator());
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        PlatformIO.getDirSeparator(),
      );

      return (
        (containingDirectoryPath
          ? containingDirectoryPath + PlatformIO.getDirSeparator()
          : '') +
        generateFileName(
          fileName,
          [...extractedTags, ...uniqueTags],
          tagDelimiter,
          prefixTagContainer,
        )
      );
    }
    return path;
  }

  function addFilesTags(files: {
    [filePath: string]: TS.Tag[];
  }): Promise<boolean> {
    if (files) {
      const promises = Object.entries(files).map(([filePath, tags]) =>
        addTagsToEntry(filePath, tags, false).then((newPath) => ({
          filePath,
          newPath,
        })),
      );
      return Promise.all(promises).then((editedPaths) => {
        const promiseReflect: Promise<TS.EditAction>[] = [];
        for (let i = 0; i < editedPaths.length; i++) {
          const { filePath, newPath } = editedPaths[i];
          promiseReflect.push(
            getAllPropertiesPromise(newPath).then(
              (fsEntry: TS.FileSystemEntry) => {
                const currentAction: TS.EditAction = {
                  action: 'update',
                  entry: fsEntry,
                  oldEntryPath: filePath,
                };
                return currentAction;
              },
            ),
          );
        }
        return Promise.all(promiseReflect).then((actionsArray) => {
          setReflectActions(...actionsArray);
          return true;
        });
      });
    }
    return Promise.resolve(true);
  }

  function addTags(
    paths: Array<string>,
    tags: Array<TS.Tag>,
  ): Promise<boolean> {
    let defaultTagLocation;
    if (geoTaggingFormat.toLowerCase() === 'mgrs') {
      defaultTagLocation = mgrs.forward([0, 51.48]);
    } else {
      defaultTagLocation = OpenLocationCode.encode(51.48, 0, undefined);
    }

    const processedTags = [];
    tags.map((pTag) => {
      const tag = { ...pTag };
      tag.type = persistTagsInSidecarFile ? 'sidecar' : 'plain';
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
            tag.title = defaultTagLocation;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            showNotification(
              t('core:thisFunctionalityIsAvailableInPro' as any) as string,
            );
          }
        } else if (tag.functionality === 'dateTagging') {
          if (Pro) {
            tag.path = paths[0]; // todo rethink and remove this!
            // delete tag.functionality;
            tag.title = formatDateTime4Tag(new Date(), true); // defaultTagDate;
            dispatch(AppActions.toggleEditTagDialog(tag));
          } else {
            showNotification(
              t('core:thisFunctionalityIsAvailableInPro' as any) as string,
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
      if (addTagsToLibrary) {
        // collecting tags
        // filter existed in tagLibrary
        const uniqueTags: TS.Tag[] = [];
        processedTags.map((tag) => {
          if (
            getTagLibrary().findIndex(
              (tagGroup) =>
                tagGroup.children.findIndex(
                  (obj) => obj.title === tag.title,
                ) !== -1,
            ) === -1 &&
            !/^(?:\d+~\d+|\d+)$/.test(tag.title) && // skip adding of tag containing only digits
            !isGeoTag(tag.title) // skip adding of tag containing geo information
          ) {
            uniqueTags.push({
              ...tag,
              color: tag.color || tagBackgroundColor,
              textcolor: tag.textcolor || tagTextColor,
            });
          }
          return true;
        });
        if (uniqueTags.length > 0) {
          const tagGroup = {
            uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
            title: t('core:collectedTags' as any) as string,
            color: tagBackgroundColor,
            textcolor: tagTextColor,
            children: uniqueTags,
            created_date: new Date().getTime(),
            modified_date: new Date().getTime(),
          };
          mergeTagGroup(tagGroup, getTagLibrary());
          dispatch(AppActions.tagLibraryChanged());
        }
      }

      const files = {};
      paths.map((path) => {
        files[path] = processedTags;
      });
      return addFilesTags(files);

      /*return Promise.all(promises).then((editedPaths) => {
        let sideCarChanges = editedPaths.filter((item) => paths.includes(item));
        if (sideCarChanges.length > 0) {
          reflectUpdateMeta(...sideCarChanges);
        }
        return true;
      });*/
    }
    return Promise.resolve(false);
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

  /**
   * @param entry: TS.FileSystemEntry
   * @param tags
   * @param reflect
   * return newPath
   */
  async function addTagsToFsEntry(
    entry: TS.FileSystemEntry,
    tags: Array<TS.Tag>,
    reflect: boolean = true,
  ): Promise<string> {
    if (entry) {
      let fsEntryMeta;
      try {
        fsEntryMeta = entry.isFile
          ? await loadFileMetaDataPromise(entry.path)
          : await loadDirMetaDataPromise(entry.path);
      } catch (error) {
        console.log('No sidecar found ' + error);
      }

      if (!entry.isFile || persistTagsInSidecarFile) {
        // Handling adding tags in sidecar
        if (fsEntryMeta) {
          const uniqueTags = getNonExistingTags(
            tags,
            extractTags(entry.path, tagDelimiter, PlatformIO.getDirSeparator()),
            fsEntryMeta.tags,
          );
          if (uniqueTags.length > 0) {
            const newTags: TS.Tag[] = [...fsEntryMeta.tags, ...uniqueTags];
            const updatedFsEntryMeta = {
              ...fsEntryMeta,
              tags: newTags,
            };
            return saveMetaDataPromise(entry.path, updatedFsEntryMeta)
              .then(() => {
                if (reflect) {
                  reflectUpdateMeta(entry.path);
                }
                return entry.path;
              })
              .catch((err) => {
                console.warn(
                  'Error adding tags for ' + entry.path + ' with ' + err,
                );
                showNotification(
                  t('core:addingTagsFailed' as any) as string,
                  'error',
                  true,
                );
                return entry.path;
              });
          }
        } else {
          const newFsEntryMeta = { tags };
          return saveMetaDataPromise(entry.path, newFsEntryMeta)
            .then(() => {
              if (reflect) {
                reflectUpdateMeta(entry.path);
              }
              return entry.path;
            })
            .catch((error) => {
              console.warn(
                'Error adding tags for ' + entry.path + ' with ' + error,
              );
              showNotification(
                t('core:addingTagsFailed' as any) as string,
                'error',
                true,
              );
              return entry.path;
            });
        }
      } else if (fsEntryMeta) {
        // Handling tags in filename by existing sidecar
        const extractedTags = extractTags(
          entry.path,
          tagDelimiter,
          PlatformIO.getDirSeparator(),
        );
        const uniqueTags = getNonExistingTags(
          tags,
          extractedTags,
          fsEntryMeta.tags,
        );
        if (uniqueTags.length > 0) {
          const newFilePath = addTagsToFilePath(
            entry.path,
            uniqueTags.map((tag) => tag.title),
          );
          if (entry.path !== newFilePath) {
            return renameFile(entry.path, newFilePath, reflect).then(() => {
              return newFilePath;
            });
          }
        }
      } else {
        // Handling tags in filename by no sidecar
        const newFilePath = addTagsToFilePath(
          entry.path,
          tags.map((tag) => tag.title),
        );
        if (entry.path !== newFilePath) {
          return renameFile(entry.path, newFilePath, reflect).then(() => {
            return newFilePath;
          });
        }
      }
      return Promise.resolve(entry.path);

      function getNonExistingTags(
        newTagsArray: Array<TS.Tag>,
        fileTagsArray: string[],
        sideCarTagsArray: Array<TS.Tag>,
      ): TS.Tag[] {
        const newTags = [];
        for (let i = 0; i < newTagsArray.length; i += 1) {
          // check if tag is already in the fileTagsArray
          if (fileTagsArray.indexOf(newTagsArray[i].title) === -1) {
            // check if tag is already in the sideCarTagsArray
            if (
              sideCarTagsArray.findIndex(
                (sideCarTag) => sideCarTag.title === newTagsArray[i].title,
              ) === -1
            ) {
              newTags.push(newTagsArray[i]);
            }
          }
        }
        return newTags;
      }
    }
    return Promise.resolve('');
  }
  /**
   * @param path
   * @param tags
   * @param reflect
   * return newPath
   */
  function addTagsToEntry(
    path: string,
    tags: Array<TS.Tag>,
    reflect: boolean = true,
  ): Promise<string> {
    return PlatformIO.getPropertiesPromise(path).then((entry) =>
      addTagsToFsEntry(entry, tags, reflect),
    );
  }

  /**
   * if Tag not exist in meta it will be added see: addMode
   * @param path
   * @param tag
   * @param newTagTitle
   * @returns {Function}
   */
  async function editTagForEntry(
    path: string,
    tag: TS.Tag,
    newTagTitle?: string,
  ) {
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
      if (entryProperties.isFile && !persistTagsInSidecarFile) {
        tag.type = 'plain';
      }
    }
    delete tag.description;
    delete tag.functionality;
    delete tag.path;
    delete tag.id;

    const extractedTags: string[] = extractTags(
      path,
      tagDelimiter,
      PlatformIO.getDirSeparator(),
    );
    // TODO: Handle adding already added tags
    if (extractedTags.includes(tag.title)) {
      // tag.type === 'plain') {
      const fileName = extractFileName(path, PlatformIO.getDirSeparator());
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        PlatformIO.getDirSeparator(),
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
        tagDelimiter,
        prefixTagContainer,
      );
      if (newFileName !== fileName) {
        await renameFile(
          path,
          containingDirectoryPath + PlatformIO.getDirSeparator() + newFileName,
        );
      }
    } else {
      //if (tag.type === 'sidecar') {
      loadMetaDataPromise(path)
        .then((fsEntryMeta) => {
          let tagFoundPosition = -1;
          let newTagsArray = fsEntryMeta.tags.map((sidecarTag, index) => {
            if (sidecarTag.title === tag.title) {
              tagFoundPosition = index;
              return {
                ...sidecarTag,
                title: newTagTitle,
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
              array.findIndex((el) => el.title === item.title) === pos,
          );
          saveMetaDataPromise(path, {
            ...fsEntryMeta,
            tags: newTagsArray,
          })
            .then(() => {
              reflectUpdateMeta(path);
              return true;
            })
            .catch((err) => {
              console.warn('Error adding tags for ' + path + ' with ' + err);
              showNotification(
                t('core:addingTagsFailed' as any) as string,
                'error',
                true,
              );
            });
          return true;
        })
        .catch((error) => {
          // json metadata not exist -create the new one
          console.warn(
            'json metadata not exist create new ' + path + ' with ' + error,
          );
          // dispatch(AppActions.showNotification(t('core:addingTagsFailed'), 'error', true));
          // eslint-disable-next-line no-param-reassign
          tag.title = newTagTitle;
          const fsEntryMeta = { tags: [tag] };
          saveMetaDataPromise(path, fsEntryMeta)
            .then(() => {
              reflectUpdateMeta(path);
              return true;
            })
            .catch((err) => {
              console.warn('Error adding tags for ' + path + ' with ' + err);
              showNotification(
                t('core:addingTagsFailed' as any) as string,
                'error',
                true,
              );
            });
        });
    }

    if (addTagsToLibrary) {
      // collecting tags
      // filter existed in tagLibrary
      const uniqueTags = [];
      if (
        getTagLibrary().findIndex(
          (tagGroup) =>
            tagGroup.children.findIndex((obj) => obj.title === newTagTitle) !==
            -1,
        ) === -1 &&
        !/^(?:\d+~\d+|\d+)$/.test(newTagTitle) &&
        !isGeoTag(newTagTitle) // skip adding of tag containing only digits or geo tags
      ) {
        uniqueTags.push({
          ...tag,
          title: newTagTitle,
          color: tag.color || tagBackgroundColor,
          textcolor: tag.textcolor || tagTextColor,
        });
      }
      if (uniqueTags.length > 0) {
        const tagGroup = {
          uuid: 'collected_tag_group_id', // uuid needs to be constant here (see mergeTagGroup)
          title: t('core:collectedTags' as any) as string,
          color: tagBackgroundColor,
          textcolor: tagTextColor,
          children: uniqueTags,
          created_date: new Date().getTime(),
          modified_date: new Date().getTime(),
        };
        mergeTagGroup(tagGroup, getTagLibrary());
        dispatch(AppActions.tagLibraryChanged());
      }
    }
  }

  function removeTags(
    paths: Array<string>,
    tags?: Array<TS.Tag>,
  ): Promise<boolean> {
    const promises = paths.map((path) =>
      removeTagsFromEntry(path, tags, false),
    );
    return Promise.all(promises).then((editedPaths) => {
      const promiseReflect: Promise<TS.EditAction>[] = [];
      for (let i = 0; i < editedPaths.length; i++) {
        promiseReflect.push(
          getAllPropertiesPromise(editedPaths[i]).then(
            (fsEntry: TS.FileSystemEntry) => {
              const currentAction: TS.EditAction = {
                action: 'update',
                entry: fsEntry,
                oldEntryPath: paths[i],
              };
              return currentAction;
            },
          ),
        );
      }
      return Promise.all(promiseReflect).then((actionsArray) => {
        setReflectActions(...actionsArray);
        return true;
      });
    });
  }

  /**
   * @param path
   * @param tags? if undefined will remove all tags
   * @param reflect
   * return newPath
   */
  function removeTagsFromEntry(
    path: string,
    tags?: Array<TS.Tag>,
    reflect: boolean = true,
  ): Promise<string> {
    const tagTitlesForRemoving = tags
      ? tags.map((tag) => tag.title)
      : undefined;
    return loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        const newTags = tagTitlesForRemoving
          ? fsEntryMeta.tags.filter(
              (sidecarTag) => !tagTitlesForRemoving.includes(sidecarTag.title),
            )
          : [];

        return removeTagsFromFilename(fsEntryMeta.isFile, reflect).then(
          (newFilePath) => {
            return removeTagsFromSideCar(
              fsEntryMeta,
              newTags,
              newFilePath,
            ).then(() => {
              if (reflect) {
                reflectUpdateMeta(newFilePath);
              }
              return newFilePath;
            });
          },
        );
      })
      .catch((error) => {
        console.warn('Error removing tags for ' + path + ' with ' + error);
        // dispatch(AppActions.showNotification(t('core:removingSidecarTagsFailed'), 'error', true));
        return removeTagsFromFilename(true, reflect);
      });

    function removeTagsFromSideCar(
      fsEntryMeta: TS.FileSystemEntryMeta,
      newTags,
      newFilePath,
    ): Promise<boolean> {
      if (newFilePath === path) {
        // no file rename - only sidecar tags removed
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: newTags,
        };
        return saveMetaDataPromise(path, updatedFsEntryMeta)
          .then(() => {
            reflectUpdateMeta(newFilePath);
            return true;
          })
          .catch((err) => {
            console.warn(
              'Removing sidecar tags failed ' + path + ' with ' + err,
            );
            showNotification(
              t('core:removingSidecarTagsFailed' as any) as string,
              'error',
              true,
            );
            return false;
          });
      }
      return Promise.resolve(true);
    }
    /**
     * return new file path
     * @param isFile
     * @param reflect
     */
    function removeTagsFromFilename(
      isFile: boolean = true,
      reflect = true,
    ): Promise<string> {
      if (!isFile) {
        return Promise.resolve(path);
      }
      return new Promise(async (resolve, reject) => {
        let extractedTags = extractTags(
          path,
          tagDelimiter,
          PlatformIO.getDirSeparator(),
        );
        if (extractedTags.length > 0) {
          const fileName = extractFileName(path, PlatformIO.getDirSeparator());
          const containingDirectoryPath = extractContainingDirectoryPath(
            path,
            PlatformIO.getDirSeparator(),
          );
          if (tagTitlesForRemoving) {
            for (let i = 0; i < tagTitlesForRemoving.length; i += 1) {
              const tagLoc = extractedTags.indexOf(tagTitlesForRemoving[i]);
              if (tagLoc < 0) {
                console.log(
                  'The tag cannot be removed because it is not part of the file name.',
                );
              } else {
                extractedTags.splice(tagLoc, 1);
              }
            }
          } else {
            extractedTags = [];
          }
          const newFilePath =
            (containingDirectoryPath
              ? containingDirectoryPath + PlatformIO.getDirSeparator()
              : '') +
            generateFileName(
              fileName,
              extractedTags,
              tagDelimiter,
              prefixTagContainer,
            );
          if (path !== newFilePath) {
            const success = await renameFile(path, newFilePath, reflect);
            if (!success) {
              reject(new Error('Error renaming file'));
              return;
            }
          }
          resolve(newFilePath);
        } else {
          resolve(path);
        }
      });
    }
  }

  function removeAllTags(paths: Array<string>): Promise<boolean> {
    return removeTags(paths);
  }

  function collectTagsFromLocation(tagGroup: TS.TagGroup) {
    if (getIndex().length < 1) {
      showNotification('Please index location first', 'error', true);
      return true;
    }

    const uniqueTags = collectTagsFromIndex(getIndex(), tagGroup);
    if (uniqueTags.length > 0) {
      const changedTagGroup = {
        ...tagGroup,
        children: uniqueTags,
        modified_date: new Date().getTime(),
      };
      mergeTagGroup(changedTagGroup, getTagLibrary(), locations);
      // dispatch(TagLibraryActions.mergeTagGroup(changedTagGroup));
    }
  }

  function collectTagsFromIndex(locationIndex: any, tagGroup: any) {
    const uniqueTags = [];
    const defaultTagColor = tagBackgroundColor;
    const defaultTagTextColor = tagTextColor;
    locationIndex.map((entry) => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.map((tag) => {
          if (
            uniqueTags.findIndex((obj) => obj.title === tag.title) < 0 && // element not already added
            tagGroup.children.findIndex((obj) => obj.title === tag.title) < 0 && // element not already added
            !/^(?:\d+~\d+|\d+)$/.test(tag.title) && // skip adding of tag containing only digits
            !isGeoTag(tag.title) // skip adding of tag containing geo information
          ) {
            uniqueTags.push({
              ...tag,
              color: tag.color || defaultTagColor,
              textcolor: tag.textcolor || defaultTagTextColor,
            });
          }
          return true;
        });
      }
      return true;
    });
    return uniqueTags;
  }

  const context = useMemo(() => {
    return {
      extractContent,
      addFilesTags,
      addTags,
      addTagsToEntry,
      editTagForEntry,
      removeTags,
      removeTagsFromEntry,
      removeAllTags,
      collectTagsFromLocation,
    };
  }, [persistTagsInSidecarFile, addTagsToLibrary, currentDirectoryEntries]);

  return (
    <TaggingActionsContext.Provider value={context}>
      {children}
    </TaggingActionsContext.Provider>
  );
};
