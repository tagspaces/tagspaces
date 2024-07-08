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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { useSelector } from 'react-redux';
import mgrs from 'mgrs';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { TS } from '-/tagspaces.namespace';
import OpenLocationCode from 'open-location-code-typescript';
import {
  immutablySwapItems,
  formatDateTime4Tag,
} from '@tagspaces/tagspaces-common/misc';
import { getTagLibrary, setTagLibrary } from '-/services/taglibrary-utils';
import { isGeoTag } from '-/utils/geo';
import {
  getAddTagsToLibrary,
  getFileNameTagPlace,
  getGeoTaggingFormat,
  getPrefixTagContainer,
  getSaveTagInLocation,
  getTagColor,
  getTagDelimiter,
  getTagTextColor,
} from '-/reducers/settings';
import { parseNewTags } from '-/services/utils-io';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractTags,
  generateFileName,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import AppConfig from '-/AppConfig';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { CommonLocation } from '-/utils/CommonLocation';
import LoadingLazy from '-/components/LoadingLazy';

type TaggingActionsContextData = {
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
  createTagGroup: (
    entry: TS.TagGroup,
    location?: CommonLocation,
  ) => Promise<boolean>;
  mergeTagGroup: (entry: TS.TagGroup) => void;
  removeTagGroup: (parentTagGroupUuid: TS.Uuid) => void;
  addTag: (tag: any, parentTagGroupUuid: TS.Uuid) => void;
  editTag: (
    tag: TS.Tag,
    parentTagGroupUuid: TS.Uuid,
    origTitle: string,
  ) => void;
  deleteTag: (tagTitle: string, parentTagGroupUuid: TS.Uuid) => void;
  moveTag: (
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid,
  ) => void;
  changeTagOrder: (
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number,
  ) => void;
  moveTagGroupUp: (parentTagGroupUuid: TS.Uuid) => void;
  moveTagGroupDown: (parentTagGroupUuid: TS.Uuid) => void;
  moveTagGroup: (tagGroupUuid: TS.Uuid, position: number) => void;
  sortTagGroup: (parentTagGroupUuid: TS.Uuid) => void;
  updateTagGroup: (tg: TS.TagGroup, replaceTags?: boolean) => void;
  importTagGroups: (
    newEntries: Array<TS.TagGroup>,
    replace?: boolean,
    location?: CommonLocation,
  ) => void;
  openEditEntryTagDialog: (tag: TS.Tag) => void;
  closeEditEntryTagDialog: () => void;
};

export const TaggingActionsContext = createContext<TaggingActionsContextData>({
  addFilesTags: undefined,
  addTags: undefined,
  addTagsToEntry: undefined,
  editTagForEntry: undefined,
  removeTags: undefined,
  removeTagsFromEntry: undefined,
  removeAllTags: undefined,
  collectTagsFromLocation: undefined,
  createTagGroup: undefined,
  mergeTagGroup: undefined,
  removeTagGroup: undefined,
  addTag: undefined,
  editTag: undefined,
  deleteTag: undefined,
  moveTag: undefined,
  changeTagOrder: undefined,
  moveTagGroupUp: undefined,
  moveTagGroupDown: undefined,
  moveTagGroup: undefined,
  sortTagGroup: undefined,
  updateTagGroup: undefined,
  importTagGroups: undefined,
  openEditEntryTagDialog: undefined,
  closeEditEntryTagDialog: undefined,
});

export type TaggingActionsContextProviderProps = {
  children: React.ReactNode;
};

const EditEntryTagDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "EditEntryTagDialog" */ '../components/dialogs/EditEntryTagDialog'
    ),
);

export const TaggingActionsContextProvider = ({
  children,
}: TaggingActionsContextProviderProps) => {
  const { t } = useTranslation();
  const { findLocation, currentLocation, persistTagsInSidecarFile } =
    useCurrentLocationContext();
  const { tagGroups, reflectTagLibraryChanged } = useEditedTagLibraryContext();
  const {
    createLocationTagGroup,
    editLocationTagGroup,
    removeLocationTagGroup,
    mergeLocationTagGroup,
  } = useTagGroupsLocationContext();
  const { currentDirectoryEntries, getAllPropertiesPromise } =
    useDirectoryContentContext();
  const { getIndex } = useLocationIndexContext();
  const { renameFile, saveMetaDataPromise, saveCurrentLocationMetaData } =
    useIOActionsContext();
  const { reflectUpdateMeta, setReflectActions } = useEditedEntryContext();
  const { showNotification } = useNotificationContext();

  const open = useRef<boolean>(false);
  const selectedTag = useRef<TS.Tag>(undefined);

  const geoTaggingFormat = useSelector(getGeoTaggingFormat);
  const addTagsToLibrary = useSelector(getAddTagsToLibrary);
  const tagBackgroundColor: string = useSelector(getTagColor);
  const tagTextColor: string = useSelector(getTagTextColor);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const prefixTagContainer: boolean = useSelector(getPrefixTagContainer);
  //const locations: CommonLocation[] = useSelector(getLocations);
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function addTagsToFilePath(path: string, tags: string[]) {
    if (tags && tags.length > 0) {
      const extractedTags: string[] = extractTags(
        path,
        tagDelimiter,
        currentLocation?.getDirSeparator(),
      );
      const uniqueTags = tags.filter(
        (tag) => !extractedTags.some((tagName) => tagName === tag),
      );
      const fileName = extractFileName(
        path,
        currentLocation?.getDirSeparator(),
      );
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        currentLocation?.getDirSeparator(),
      );

      return (
        (containingDirectoryPath
          ? containingDirectoryPath +
            (currentLocation
              ? currentLocation.getDirSeparator()
              : AppConfig.dirSeparator)
          : '') +
        generateFileName(
          fileName,
          [...extractedTags, ...uniqueTags],
          tagDelimiter,
          currentLocation?.getDirSeparator(),
          prefixTagContainer,
          filenameTagPlacedAtEnd,
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
          if (newPath !== undefined) {
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
            openEditEntryTagDialog(tag);
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
            openEditEntryTagDialog(tag);
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
          mergeTagGroup(tagGroup);
          //dispatch(AppActions.tagLibraryChanged());
        }
      }

      const files = {};
      paths.map((path) => {
        files[path] = processedTags;
      });
      return addFilesTags(files);
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
          ? await currentLocation.loadFileMetaDataPromise(entry.path)
          : await currentLocation.loadDirMetaDataPromise(entry.path);
      } catch (error) {
        console.log('No sidecar found ' + error);
      }

      if (!entry.isFile || persistTagsInSidecarFile) {
        // Handling adding tags in sidecar
        if (fsEntryMeta) {
          const uniqueTags = getNonExistingTags(
            tags,
            extractTags(
              entry.path,
              tagDelimiter,
              currentLocation?.getDirSeparator(),
            ),
            fsEntryMeta.tags,
          );
          if (uniqueTags.length > 0) {
            const newTags: TS.Tag[] = [...fsEntryMeta.tags, ...uniqueTags];
            const updatedFsEntryMeta = {
              ...fsEntryMeta,
              tags: newTags,
            };
            return saveMetaDataPromise(entry, updatedFsEntryMeta)
              .then((meta) => {
                if (reflect) {
                  reflectUpdateMeta({ ...entry, meta });
                }
                return entry.path;
              })
              .catch((err) => {
                console.log(
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
          return saveMetaDataPromise(entry, newFsEntryMeta)
            .then((meta) => {
              if (reflect) {
                reflectUpdateMeta({ ...entry, meta });
              }
              return entry.path;
            })
            .catch((error) => {
              console.log(
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
          currentLocation?.getDirSeparator(),
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
            return renameFile(
              entry.path,
              newFilePath,
              entry.locationID,
              reflect,
            ).then((success) => {
              return success ? newFilePath : undefined;
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
          return renameFile(
            entry.path,
            newFilePath,
            entry.locationID,
            reflect,
          ).then((success) => {
            return success ? newFilePath : undefined;
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
    return currentLocation
      .getPropertiesPromise(path)
      .then((entry) => addTagsToFsEntry(entry, tags, reflect));
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
      const entryProperties = await currentLocation.getPropertiesPromise(path);
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
      currentLocation?.getDirSeparator(),
    );
    // TODO: Handle adding already added tags
    if (extractedTags.includes(tag.title)) {
      //tag.type === 'plain') {

      const fileName = extractFileName(
        path,
        currentLocation?.getDirSeparator(),
      );
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        currentLocation?.getDirSeparator(),
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
        currentLocation?.getDirSeparator(),
        prefixTagContainer,
        filenameTagPlacedAtEnd,
      );
      if (newFileName !== fileName) {
        await renameFile(
          path,
          containingDirectoryPath +
            (currentLocation
              ? currentLocation.getDirSeparator()
              : AppConfig.dirSeparator) +
            newFileName,
          currentLocation.uuid,
        );
      }
    } else {
      //if (tag.type === 'sidecar') {
      currentLocation
        .loadMetaDataPromise(path)
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
          saveCurrentLocationMetaData(path, {
            ...fsEntryMeta,
            tags: newTagsArray,
          })
            .then(() => {
              getAllPropertiesPromise(path).then((entry) =>
                reflectUpdateMeta(entry),
              );
              return true;
            })
            .catch((err) => {
              console.log('Error adding tags for ' + path + ' with ' + err);
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
          console.log(
            'json metadata not exist create new ' + path + ' with ' + error,
          );
          // dispatch(AppActions.showNotification(t('core:addingTagsFailed'), 'error', true));
          // eslint-disable-next-line no-param-reassign
          tag.title = newTagTitle;
          const fsEntryMeta = { tags: [tag] };
          saveCurrentLocationMetaData(path, fsEntryMeta)
            .then(() => {
              getAllPropertiesPromise(path).then((entry) =>
                reflectUpdateMeta(entry),
              );
              return true;
            })
            .catch((err) => {
              console.log('Error adding tags for ' + path + ' with ' + err);
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
        mergeTagGroup(tagGroup);
        // dispatch(AppActions.tagLibraryChanged());
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
        if (editedPaths[i]) {
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
    return currentLocation
      .loadMetaDataPromise(path)
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
              reflect,
            ).then(() => {
              if (reflect) {
                getAllPropertiesPromise(newFilePath).then((entry) =>
                  reflectUpdateMeta(entry),
                );
              }
              return newFilePath;
            });
          },
        );
      })
      .catch((error) => {
        console.log('Error removing tags for ' + path + ' with ' + error);
        // dispatch(AppActions.showNotification(t('core:removingSidecarTagsFailed'), 'error', true));
        return removeTagsFromFilename(true, reflect);
      });

    function removeTagsFromSideCar(
      fsEntryMeta: TS.FileSystemEntryMeta,
      newTags,
      newFilePath,
      reflect,
    ): Promise<boolean> {
      if (JSON.stringify(fsEntryMeta.tags) !== JSON.stringify(newTags)) {
        //newFilePath === path) {
        // no file rename - only sidecar tags removed
        const updatedFsEntryMeta = {
          ...fsEntryMeta,
          tags: newTags,
        };
        return saveCurrentLocationMetaData(newFilePath, updatedFsEntryMeta)
          .then(() => {
            if (reflect) {
              getAllPropertiesPromise(newFilePath).then((entry) =>
                reflectUpdateMeta(entry),
              );
            }
            return true;
          })
          .catch((err) => {
            console.log(
              'Removing sidecar tags failed ' + newFilePath + ' with ' + err,
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
          currentLocation?.getDirSeparator(),
        );
        if (extractedTags.length > 0) {
          const fileName = extractFileName(
            path,
            currentLocation?.getDirSeparator(),
          );
          const containingDirectoryPath = extractContainingDirectoryPath(
            path,
            currentLocation?.getDirSeparator(),
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
              ? containingDirectoryPath + currentLocation.getDirSeparator()
              : '') +
            generateFileName(
              fileName,
              extractedTags,
              tagDelimiter,
              currentLocation?.getDirSeparator(),
              prefixTagContainer,
              filenameTagPlacedAtEnd,
            );
          if (path !== newFilePath) {
            const success = await renameFile(
              path,
              newFilePath,
              currentLocation.uuid,
              reflect,
            );
            if (!success) {
              resolve(undefined);
              //reject(new Error('Error renaming file'));
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
      mergeTagGroup(changedTagGroup);
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

  function saveTagLibrary(tg: TS.TagGroup[]) {
    reflectTagLibraryChanged(setTagLibrary(tg));
  }

  function saveTags(tags: TS.Tag[], indexForEditing: number) {
    if (indexForEditing >= 0) {
      /*const taggroupTags = tagGroups[indexForEditing].children;
      if (
        !taggroupTags.some((tag) => tags.some((t) => t.title === tag.title))
      ) {*/
      saveTagLibrary([
        ...tagGroups.slice(0, indexForEditing),
        {
          ...tagGroups[indexForEditing],
          children: tags,
        },
        ...tagGroups.slice(indexForEditing + 1),
      ]);
    }
  }

  function updateTagGroup(entry: TS.TagGroup, replaceTags = false) {
    let indexForEditing = tagGroups.findIndex(
      (tagGroup) => tagGroup.uuid === entry.uuid,
    );

    if (indexForEditing >= 0) {
      const modifiedEntry = {
        ...entry,
        ...(!entry.created_date && { created_date: new Date().getTime() }),
        ...(!entry.modified_date && { modified_date: new Date().getTime() }),
      };
      if (Pro && entry.locationId) {
        const location: CommonLocation = findLocation(entry.locationId);
        if (location) {
          editLocationTagGroup(location, modifiedEntry, replaceTags);
        }
      }

      return saveTagLibrary([
        ...tagGroups.slice(0, indexForEditing),
        modifiedEntry,
        ...tagGroups.slice(indexForEditing + 1),
      ]);
    }
  }

  /*function saveTagInt(
    newTag: TS.Tag,
    parentTagGroupUuid: TS.Uuid
  ) {
    let indexForEditing = tagGroups.findIndex(
      (tagGroup) => tagGroup.uuid === parentTagGroupUuid,
    );

    if (indexForEditing >= 0) {
      const taggroupTags = tagGroups[indexForEditing].children;
      if (!taggroupTags.some((tag) => tag.title === newTag.title)) {
        return saveTagLibrary([
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
  }*/

  function createTagGroup(
    entry: TS.TagGroup,
    location?: CommonLocation,
  ): Promise<boolean> {
    const newEntry = {
      ...entry,
      created_date: new Date().getTime(),
      modified_date: new Date().getTime(),
    };
    saveTagLibrary([...tagGroups, newEntry]);
    if (Pro && location) {
      return createLocationTagGroup(location, newEntry).then(() => true);
    }
    return Promise.resolve(true);
  }

  function mergeTagGroup(entry: TS.TagGroup) {
    if (Pro && entry.locationId) {
      const location: CommonLocation = findLocation(entry.locationId);
      if (location) {
        mergeLocationTagGroup(location, entry);
      }
    }
    const indexForEditing = tagGroups.findIndex(
      (obj) => obj.uuid === entry.uuid,
    );
    if (indexForEditing > -1) {
      const tags = [...tagGroups[indexForEditing].children, ...entry.children];
      tags.splice(0, tags.length - AppConfig.maxCollectedTag);
      saveTagLibrary([
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
    } else {
      saveTagLibrary([
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
  }

  function removeTagGroup(parentTagGroupUuid: TS.Uuid) {
    const indexForRemoving = tagGroups.findIndex(
      (t) => t.uuid === parentTagGroupUuid,
    );
    if (indexForRemoving >= 0) {
      const tagGroup: TS.TagGroup = tagGroups[indexForRemoving];
      if (Pro && tagGroup && tagGroup.locationId) {
        const location: CommonLocation = findLocation(tagGroup.locationId);
        if (location) {
          removeLocationTagGroup(location, parentTagGroupUuid);
        }
      }

      saveTagLibrary([
        ...tagGroups.slice(0, indexForRemoving),
        ...tagGroups.slice(indexForRemoving + 1),
      ]);
    }
  }

  function addTag(tag: any, parentTagGroupUuid: TS.Uuid) {
    const tgIndex = tagGroups.findIndex(
      (tagGroup) => tagGroup.uuid === parentTagGroupUuid,
    );
    if (tgIndex > -1) {
      const tagGroup = tagGroups[tgIndex];
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
        //tagGroupsReturn = saveTagInt(tagObject, parentTagGroupUuid, tagGroups);
      } else {
        const newTagGroup = {
          ...tagGroup,
          color: tagGroup.color, // ? tagGroup.color : tagBackgroundColor,
          textcolor: tagGroup.textcolor, // ? tagGroup.textcolor : tagTextColor
        };
        newTags = parseNewTags(tag, newTagGroup);
      }
      saveTags(newTags, tgIndex);

      if (Pro && tagGroup && tagGroup.locationId) {
        const location: CommonLocation = findLocation(tagGroup.locationId);
        if (location) {
          tagGroup.children = newTags;
          editLocationTagGroup(location, tagGroup);
        }
      }
    }
  }

  function editTag(
    tag: TS.Tag,
    parentTagGroupUuid: TS.Uuid,
    origTitle: string,
  ) {
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
      updateTagGroup(newTagGroup, true);
    }
  }

  function deleteTag(tagTitle: string, parentTagGroupUuid: TS.Uuid) {
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

      updateTagGroup(editedTagGroup, true);
    }
  }

  function moveTag(
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid,
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
      const tag = {
        ...tagGroups[indexFromGroup].children[tagIndexForRemoving],
      };
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
        return saveTagLibrary(newTagLibrary);
      }
      console.log('Tag with this title already exists in the target tag group');
    }
  }

  function changeTagOrder(
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number,
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

      saveTagLibrary(newTagLibrary);
    }
  }

  function moveTagGroupUp(parentTagGroupUuid: TS.Uuid) {
    let indexForUpdating = tagGroups.findIndex(
      (t) => t.uuid === parentTagGroupUuid,
    );
    if (indexForUpdating > 0) {
      const secondIndex = indexForUpdating - 1;
      return saveTagLibrary(
        immutablySwapItems(tagGroups, indexForUpdating, secondIndex),
      );
    }
    return tagGroups;
  }

  function moveTagGroupDown(parentTagGroupUuid: TS.Uuid) {
    let indexForUpdating = tagGroups.findIndex(
      (t) => t.uuid === parentTagGroupUuid,
    );
    if (indexForUpdating >= 0 && indexForUpdating < tagGroups.length - 1) {
      const secondIndex = indexForUpdating + 1;
      return saveTagLibrary(
        immutablySwapItems(tagGroups, indexForUpdating, secondIndex),
      );
    }
    return tagGroups;
  }

  function moveTagGroup(tagGroupUuid: TS.Uuid, position: number) {
    let indexForUpdating = tagGroups.findIndex((t) => t.uuid === tagGroupUuid);
    if (indexForUpdating > -1 && indexForUpdating !== position) {
      const tagGroupsReturn = Array.from(tagGroups);
      const [removed] = tagGroupsReturn.splice(indexForUpdating, 1);
      tagGroupsReturn.splice(position, 0, removed);
      saveTagLibrary(tagGroupsReturn);
    }
  }

  function sortTagGroup(parentTagGroupUuid: TS.Uuid) {
    let indexForUpdating = tagGroups.findIndex(
      (t) => t.uuid === parentTagGroupUuid,
    );
    if (indexForUpdating > -1) {
      saveTagLibrary([
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
  }

  function importTagGroups(
    newEntries: Array<TS.TagGroup>,
    replace = false,
    location: CommonLocation = undefined,
  ) {
    let arr = replace ? [] : [...tagGroups];
    // console.log(arr);
    // @ts-ignore
    if (newEntries[0] && newEntries[0].key) {
      // TODO test this migration
      newEntries.forEach((newTg: TS.TagGroup, index) => {
        // migration of old tag groups 2.9 or less in the new version 3.0-present
        // @ts-ignore
        if (newTg.key === tagGroups.uuid || newTg.key !== tagGroups.uuid) {
          newTg = {
            ...(location && { locationId: location.uuid }),
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
        const exist = arr.some((obj) => obj.uuid === tagGroup.uuid);
        if (exist) {
          arr = arr.map((tGroup) => {
            if (tGroup.uuid === tagGroup.uuid) {
              return tagGroup;
            }
            return tGroup;
          });
        } else {
          arr.push({
            ...tagGroup,
            ...(location && {
              locationId: location.uuid,
            }),
          });
        }
        /*const index = arr.findIndex((obj) => obj.uuid === tagGroup.uuid);
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
          arr.push({
            ...tagGroup,
            ...(location && {
              locationId: location.uuid,
            }),
          });
        }*/
      });
    }

    saveTagLibrary(arr);
  }

  function openEditEntryTagDialog(tag: TS.Tag) {
    open.current = true;
    selectedTag.current = tag;
    forceUpdate();
  }

  function closeEditEntryTagDialog() {
    open.current = false;
    forceUpdate();
  }

  function EditEntryTagDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <EditEntryTagDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      addFilesTags,
      addTags,
      addTagsToEntry,
      editTagForEntry,
      removeTags,
      removeTagsFromEntry,
      removeAllTags,
      collectTagsFromLocation,
      createTagGroup,
      mergeTagGroup,
      removeTagGroup,
      addTag,
      editTag,
      deleteTag,
      moveTag,
      changeTagOrder,
      moveTagGroupUp,
      moveTagGroupDown,
      moveTagGroup,
      sortTagGroup,
      updateTagGroup,
      importTagGroups,
      openEditEntryTagDialog,
      closeEditEntryTagDialog,
    };
  }, [
    tagGroups,
    persistTagsInSidecarFile,
    addTagsToLibrary,
    currentDirectoryEntries,
    saveTagInLocation,
    filenameTagPlacedAtEnd,
  ]);

  return (
    <TaggingActionsContext.Provider value={context}>
      <EditEntryTagDialogAsync
        open={open.current}
        onClose={closeEditEntryTagDialog}
        tag={selectedTag.current}
      />
      {children}
    </TaggingActionsContext.Provider>
  );
};
