/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import React, { createContext, useCallback, useMemo, useState } from 'react';
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
import { setTagLibrary } from '-/services/taglibrary-utils';
import { isGeoTag } from '-/utils/geo';
import {
  getAddTagsToLibrary,
  getFileNameTagPlace,
  getGeoTaggingFormat,
  getMaxCollectedTag,
  getPrefixTagContainer,
  getSaveTagInLocation,
  getTagColor,
  getTagDelimiter,
  getTagTextColor,
} from '-/reducers/settings';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractTags,
  extractTagsAsObjects,
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
import { getAllTags } from '-/services/utils-io';

type TaggingActionsContextData = {
  addTagsToFsEntries: (
    files: TS.FileSystemEntry[],
    tags: TS.Tag[],
  ) => Promise<boolean>;
  addTags: (
    entries: TS.FileSystemEntry[],
    tags: Array<TS.Tag>,
  ) => Promise<boolean>;
  addTagsToEntry: (
    path: string,
    tags: Array<TS.Tag>,
    reflect?: boolean,
  ) => Promise<TS.FileSystemEntry>;
  addTagsToFsEntry: (
    fsEntry: TS.FileSystemEntry,
    tags: Array<TS.Tag>,
    reflect?: boolean,
    collectTags?: boolean,
  ) => Promise<TS.FileSystemEntry>;
  editTagForEntry: (path: string, tag: TS.Tag, newTagTitle?: string) => void;
  removeTags: (
    fsEntries: TS.FileSystemEntry[],
    tags?: Array<TS.Tag>,
  ) => Promise<boolean>;
  removeTagsFromEntry: (
    fsEntry: TS.FileSystemEntry,
    tags?: Array<TS.Tag>,
  ) => Promise<string>;
  collectTagsFromLocation: (tagGroup: TS.TagGroup) => void;
  createTagGroup: (
    entry: TS.TagGroup,
    location?: CommonLocation,
  ) => Promise<boolean>;
  mergeTagGroup: (entry: TS.TagGroup) => void;
  removeTagGroup: (parentTagGroupUuid: TS.Uuid) => void;
  addTag: (tag: TS.Tag[], parentTagGroupUuid: TS.Uuid) => void;
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
  openEditEntryTagDialog: (entries: TS.FileSystemEntry[], tag: TS.Tag) => void;
  closeEditEntryTagDialog: () => void;
};

export const TaggingActionsContext = createContext<TaggingActionsContextData>({
  addTagsToFsEntries: undefined,
  addTags: undefined,
  addTagsToEntry: undefined,
  addTagsToFsEntry: undefined,
  editTagForEntry: undefined,
  removeTags: undefined,
  removeTagsFromEntry: undefined,
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

const areEqual = (prevProp, nextProp) =>
  nextProp.open === prevProp.open &&
  JSON.stringify(nextProp.tag) === JSON.stringify(prevProp.tag) &&
  JSON.stringify(nextProp.entries) === JSON.stringify(prevProp.entries);

const EditEntryTagDialogAsync = React.memo(
  (props: {
    open: boolean;
    onClose: () => void;
    tag: TS.Tag;
    entries: TS.FileSystemEntry[];
  }) => (
    <React.Suspense fallback={<LoadingLazy />}>
      <EditEntryTagDialog {...props} />
    </React.Suspense>
  ),
  areEqual,
);

export const TaggingActionsContextProvider = ({
  children,
}: TaggingActionsContextProviderProps) => {
  const { t } = useTranslation();
  const { findLocation, persistTagsInSidecarFile } =
    useCurrentLocationContext();
  const { tagGroups, setTagGroups, reflectTagLibraryChanged } =
    useEditedTagLibraryContext();
  const {
    createLocationTagGroup,
    editLocationTagGroup,
    removeLocationTagGroup,
    mergeLocationTagGroup,
  } = useTagGroupsLocationContext();
  const { currentDirectoryEntries, getAllPropertiesPromise, getMetaForEntry } =
    useDirectoryContentContext();
  const { getIndex, createLocationIndex } = useLocationIndexContext();
  const { renameFile, saveMetaDataPromise, saveCurrentLocationMetaData } =
    useIOActionsContext();
  const { reflectUpdateMeta, setReflectActions } = useEditedEntryContext();
  const { showNotification, openConfirmDialog } = useNotificationContext();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    tag?: TS.Tag;
    entries?: TS.FileSystemEntry[];
  }>({ open: false });

  const geoTaggingFormat = useSelector(getGeoTaggingFormat);
  const maxCollectedTag = useSelector(getMaxCollectedTag);
  const addTagsToLibrary = useSelector(getAddTagsToLibrary);
  const tagBackgroundColor: string = useSelector(getTagColor);
  const tagTextColor: string = useSelector(getTagTextColor);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const prefixTagContainer: boolean = useSelector(getPrefixTagContainer);
  //const locations: CommonLocation[] = useSelector(getLocations);
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);
  //const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();

  function setConfirmReindexDialogOpened(tg: TS.TagGroup) {
    if (tg) {
      openConfirmDialog(
        t('core:confirmReindex'),
        t('core:confirmReindexContent'),
        (result) => {
          if (result) {
            createLocationIndex(currentLocation).then(() =>
              collectTagsFromLocation(tg),
            );
          }
        },
        'cancelConfirmReindexDialog',
        'confirmConfirmReindexDialog',
        'confirmReindexDialogContentTID',
      );
    }
  }

  function addTagsToFilePath(path: string, tags: string[]) {
    if (tags && tags.length > 0) {
      const dirSeparator = currentLocation
        ? currentLocation.getDirSeparator()
        : AppConfig.dirSeparator;
      const extractedTags: string[] = extractTags(
        path,
        tagDelimiter,
        dirSeparator,
      );
      const uniqueTags = tags.filter(
        (tag) => !extractedTags.some((tagName) => tagName === tag),
      );
      const fileName = extractFileName(path, dirSeparator);
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        dirSeparator,
      );

      return (
        (containingDirectoryPath && containingDirectoryPath !== dirSeparator
          ? containingDirectoryPath + dirSeparator
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

  function addTags(
    entries: TS.FileSystemEntry[],
    tags: TS.Tag[],
  ): Promise<boolean> {
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
            tag.title =
              geoTaggingFormat.toLowerCase() === 'mgrs'
                ? mgrs.forward([0, 51.48])
                : OpenLocationCode.encode(51.48, 0, undefined);
            openEditEntryTagDialog(entries, tag);
          } else {
            showNotification(
              t('core:thisFunctionalityIsAvailableInPro' as any) as string,
            );
          }
        } else if (tag.functionality === 'dateTagging') {
          if (Pro) {
            // delete tag.functionality;
            tag.title = formatDateTime4Tag(new Date(), false);
            tag.color = tagBackgroundColor;
            tag.textcolor = tagTextColor;
            openEditEntryTagDialog(entries, tag);
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
      collectTagsToLibrary(processedTags);

      return addTagsToFsEntries(entries, processedTags);
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

  function addTagsToFsEntries(
    entries: TS.FileSystemEntry[],
    tags: Array<TS.Tag>,
  ): Promise<boolean> {
    if (entries && entries.length > 0) {
      const promises = entries.map((entry) =>
        addTagsToFsEntry(entry, tags, false, false).then((newEntry) => ({
          oldEntryPath: entry.path,
          newEntry,
        })),
      );
      collectTagsToLibrary(tags);
      return Promise.all(promises).then((editedPaths) => {
        const reflects: TS.EditAction[] = [];
        for (let i = 0; i < editedPaths.length; i++) {
          const { oldEntryPath, newEntry } = editedPaths[i];
          if (newEntry !== undefined) {
            const currentAction: TS.EditAction = {
              action: 'update',
              entry: newEntry,
              oldEntryPath: oldEntryPath,
            };
            reflects.push(currentAction);
          }
        }
        setReflectActions(...reflects);
        return true;
      });
    }
    return Promise.resolve(true);
  }

  function saveMataDataTags(
    entry: TS.FileSystemEntry,
    updatedFsEntryMeta: TS.FileSystemEntryMeta,
    reflect = true,
  ): Promise<TS.FileSystemEntry> {
    return saveMetaDataPromise(entry, updatedFsEntryMeta)
      .then((meta) => {
        if (reflect) {
          reflectUpdateMeta({ ...entry, meta });
        }
        return { ...entry, meta };
      })
      .catch((err) => {
        console.log('Error adding tags for ' + entry.path + ' with ' + err);
        showNotification(
          t('core:addingTagsFailed') + ': ' + err.message,
          'error',
          true,
        );
        return entry;
      });
  }

  function renameFileTags(
    entry: TS.FileSystemEntry,
    newFilePath: string,
    reflect = true,
  ): Promise<TS.FileSystemEntry> {
    return renameFile(entry.path, newFilePath, entry.locationID, reflect)
      .then((success) => {
        return success
          ? {
              ...entry,
              tags: extractTagsAsObjects(
                newFilePath,
                tagDelimiter,
                currentLocation?.getDirSeparator(),
              ),
              name: extractFileName(
                newFilePath,
                currentLocation?.getDirSeparator(),
              ),
              path: newFilePath,
            }
          : undefined;
      })
      .catch((err) => {
        console.log('Error adding tags for ' + entry.path + ' with ' + err);
        showNotification(
          t('core:addingTagsFailed') + ': ' + err.message,
          'error',
          true,
        );
        return entry;
      });
  }

  function getNonExistingTags(
    newTagsArray: Array<TS.Tag>,
    fileTagsArray: string[],
    sideCarTagsArray: Array<TS.Tag>,
  ): TS.Tag[] {
    const newTags = [];
    if (newTagsArray) {
      for (let i = 0; i < newTagsArray.length; i += 1) {
        // check if tag is already in the fileTagsArray
        if (
          !fileTagsArray ||
          fileTagsArray.indexOf(newTagsArray[i].title) === -1
        ) {
          // check if tag is already in the sideCarTagsArray
          if (
            !sideCarTagsArray ||
            sideCarTagsArray.findIndex(
              (sideCarTag) => sideCarTag.title === newTagsArray[i].title,
            ) === -1
          ) {
            newTags.push(newTagsArray[i]);
          }
        }
      }
    }
    return newTags;
  }

  /**
   * @param entry: TS.FileSystemEntry
   * @param tags
   * @param reflect
   * return newFsEntry updated
   * @param collectTags
   */
  async function addTagsToFsEntry(
    entry: TS.FileSystemEntry,
    tags: Array<TS.Tag>,
    reflect: boolean = true,
    collectTags: boolean = true,
  ): Promise<TS.FileSystemEntry> {
    if (entry) {
      if (collectTags) {
        collectTagsToLibrary(tags);
      }

      if (!entry.isFile || persistTagsInSidecarFile) {
        // Handling adding tags in sidecar
        if (!entry.meta) {
          const entryMeta = await getMetaForEntry(entry);
          if (entryMeta) {
            entry.meta = entryMeta.meta;
          }
        }
        if (entry.meta) {
          const uniqueTags = getNonExistingTags(
            tags,
            extractTags(
              entry.path,
              tagDelimiter,
              currentLocation?.getDirSeparator(),
            ),
            entry.meta.tags,
          );
          if (uniqueTags.length > 0) {
            const newTags: TS.Tag[] = [
              ...(entry.meta.tags ? entry.meta.tags : []),
              ...uniqueTags,
            ];
            const updatedFsEntryMeta = {
              ...entry.meta,
              tags: newTags,
            };
            return saveMataDataTags(entry, updatedFsEntryMeta, reflect);
          }
        } else {
          const newFsEntryMeta: TS.FileSystemEntryMeta = {
            id: getUuid(),
            tags,
          };
          return saveMataDataTags(entry, newFsEntryMeta, reflect);
        }
      } else if (entry.meta) {
        // Handling tags in filename by existing sidecar
        const extractedTags = extractTags(
          entry.path,
          tagDelimiter,
          currentLocation?.getDirSeparator(),
        );
        const uniqueTags = getNonExistingTags(
          tags,
          extractedTags,
          entry.meta.tags,
        );
        if (uniqueTags.length > 0) {
          const newFilePath = addTagsToFilePath(
            entry.path,
            uniqueTags.map((tag) => tag.title),
          );
          if (entry.path !== newFilePath) {
            return renameFileTags(entry, newFilePath, reflect);
          }
        }
      } else {
        // Handling tags in filename by no sidecar
        const newFilePath = addTagsToFilePath(
          entry.path,
          tags.map((tag) => tag.title),
        );
        if (entry.path !== newFilePath) {
          return renameFileTags(entry, newFilePath, reflect);
        }
      }
      return Promise.resolve(entry);
    }
    return Promise.resolve(undefined);
  }
  /**
   * @param path
   * @param tags
   * @param reflect
   * return newFsEntry updated
   */
  function addTagsToEntry(
    path: string,
    tags: Array<TS.Tag>,
    reflect: boolean = true,
  ): Promise<TS.FileSystemEntry> {
    return getAllPropertiesPromise(path).then((entry) =>
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
    const dirSeparator = currentLocation
      ? currentLocation.getDirSeparator()
      : AppConfig.dirSeparator;
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
    delete tag.id;
    const extractedTags: string[] = extractTags(
      path,
      tagDelimiter,
      dirSeparator,
    );
    // TODO: Handle adding already added tags
    if (extractedTags.includes(tag.title)) {
      //tag.type === 'plain') {

      const fileName = extractFileName(path, dirSeparator);
      const containingDirectoryPath = extractContainingDirectoryPath(
        path,
        dirSeparator,
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
        dirSeparator,
        prefixTagContainer,
        filenameTagPlacedAtEnd,
      );
      if (newFileName !== fileName) {
        const newFilePath =
          (containingDirectoryPath && containingDirectoryPath !== dirSeparator
            ? containingDirectoryPath + dirSeparator
            : '') + newFileName;
        await renameFile(path, newFilePath, currentLocation.uuid);
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
    collectTagsToLibrary([{ ...tag, title: newTagTitle }]);
  }

  function collectTagsToLibrary(tags: TS.Tag[]) {
    if (addTagsToLibrary) {
      // collecting tags
      // filter existed in tagLibrary
      const uniqueTags = tags.filter(
        (tag) =>
          tagGroups.findIndex(
            (tagGroup) =>
              tagGroup.children.findIndex((obj) => obj.title === tag.title) !==
              -1,
          ) === -1 &&
          !/^(?:\d{8}T\d{6}|\d+~\d+|\d+)$/.test(tag.title) &&
          !isGeoTag(tag.title),
      ); // skip adding of tag containing only digits or geo tags

      /*uniqueTags.push({
          ...tag,
          color: tag.color || tagBackgroundColor,
          textcolor: tag.textcolor || tagTextColor,
        });*/
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
    fsEntries: TS.FileSystemEntry[],
    tags?: Array<TS.Tag>,
  ): Promise<boolean> {
    const promises = fsEntries.map((entry) =>
      removeTagsFromEntry(entry, tags, false),
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
                  oldEntryPath: fsEntries[i].path,
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
   * @param fsEntry: TS.FileSystemEntry
   * @param tags? if undefined will remove all tags
   * @param reflect
   * return newPath
   */
  function removeTagsFromEntry(
    fsEntry: TS.FileSystemEntry,
    tags?: Array<TS.Tag>,
    reflect: boolean = true,
  ): Promise<string> {
    const tagTitlesForRemoving = tags
      ? tags.map((tag) => tag.title)
      : undefined;
    return currentLocation
      .loadMetaDataPromise(fsEntry.path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        return removeTagsFromFilename(fsEntryMeta.isFile, reflect).then(
          (newFilePath) => {
            const newTags = tagTitlesForRemoving
              ? fsEntryMeta.tags.filter(
                  (sidecarTag) =>
                    !tagTitlesForRemoving.includes(sidecarTag.title),
                )
              : [];
            return removeTagsFromSideCar(
              fsEntryMeta,
              newTags,
              newFilePath,
              false,
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
        console.log(
          'Error removing tags for ' + fsEntry.path + ' with ' + error,
        );
        // dispatch(AppActions.showNotification(t('core:removingSidecarTagsFailed'), 'error', true));
        return removeTagsFromFilename(fsEntry.isFile, reflect);
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
        return Promise.resolve(fsEntry.path);
      }
      return new Promise(async (resolve, reject) => {
        const dirSeparator = currentLocation
          ? currentLocation.getDirSeparator()
          : AppConfig.dirSeparator;
        let extractedTags = extractTags(
          fsEntry.path,
          tagDelimiter,
          dirSeparator,
        );
        if (extractedTags.length > 0) {
          const fileName = extractFileName(fsEntry.path, dirSeparator);
          const containingDirectoryPath = extractContainingDirectoryPath(
            fsEntry.path,
            dirSeparator,
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
            (containingDirectoryPath && containingDirectoryPath !== dirSeparator
              ? containingDirectoryPath + dirSeparator
              : '') +
            generateFileName(
              fileName,
              extractedTags,
              tagDelimiter,
              dirSeparator,
              prefixTagContainer,
              filenameTagPlacedAtEnd,
            );
          if (fsEntry.path !== newFilePath) {
            const success = await renameFile(
              fsEntry.path,
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
          resolve(fsEntry.path);
        }
      });
    }
  }

  function collectTagsFromLocation(tagGroup: TS.TagGroup) {
    const index = getIndex();
    if (!index || index.length < 1) {
      //open confirm
      setConfirmReindexDialogOpened(tagGroup);
      //showNotification('Please index location first', 'error', true);
      return true;
    }

    const uniqueTags = collectTagsFromIndex(index, tagGroup);
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
      const tags = getAllTags(entry, tagDelimiter);
      if (tags && tags.length > 0) {
        tags.map((tag) => {
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
    setTagLibrary(tg); // save in localStorage
    setTagGroups(tg); // set in EditedTagLibraryContext
    reflectTagLibraryChanged(); // reflect changes in other instances
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
      const location: CommonLocation = entry.locationId
        ? findLocation(entry.locationId)
        : undefined;

      editLocationTagGroup(location, modifiedEntry, replaceTags).then(() => {
        return saveTagLibrary([
          ...tagGroups.slice(0, indexForEditing),
          modifiedEntry,
          ...tagGroups.slice(indexForEditing + 1),
        ]);
      });
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
    return createLocationTagGroup(location, newEntry).then(() => {
      saveTagLibrary([...tagGroups, newEntry]);
      return true;
    });
  }

  function mergeTagGroup(entry: TS.TagGroup) {
    const location: CommonLocation = entry.locationId
      ? findLocation(entry.locationId)
      : undefined;
    mergeLocationTagGroup(location, entry).then(() => {
      const indexForEditing = tagGroups.findIndex(
        (obj) => obj.uuid === entry.uuid,
      );
      if (indexForEditing > -1) {
        const tags = [
          ...tagGroups[indexForEditing].children,
          ...entry.children,
        ];
        tags.splice(0, tags.length - maxCollectedTag);
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
    });
  }

  function removeTagGroup(parentTagGroupUuid: TS.Uuid) {
    const indexForRemoving = tagGroups.findIndex(
      (t) => t.uuid === parentTagGroupUuid,
    );
    if (indexForRemoving >= 0) {
      const tagGroup: TS.TagGroup = tagGroups[indexForRemoving];
      const location: CommonLocation =
        tagGroup && tagGroup.locationId
          ? findLocation(tagGroup.locationId)
          : undefined;
      removeLocationTagGroup(location, parentTagGroupUuid).then(() => {
        saveTagLibrary([
          ...tagGroups.slice(0, indexForRemoving),
          ...tagGroups.slice(indexForRemoving + 1),
        ]);
      });
    }
  }

  /**
   * Add tag to tagGroup
   * @param tags
   * @param parentTagGroupUuid - tagGroup ID to add in
   */
  function addTag(tags: TS.Tag[], parentTagGroupUuid: TS.Uuid) {
    const tgIndex = tagGroups.findIndex(
      (tagGroup) => tagGroup.uuid === parentTagGroupUuid,
    );
    if (tgIndex > -1) {
      const tagGroup = tagGroups[tgIndex];

      const newTags = [
        ...tagGroup.children,
        ...tags.map((tag) => ({
          ...tag,
          ...(!tag.color && { color: tagGroup.color }),
          ...(!tag.textcolor && { textcolor: tagGroup.textcolor }),
        })),
      ];

      const location: CommonLocation =
        tagGroup && tagGroup.locationId
          ? findLocation(tagGroup.locationId)
          : undefined;

      editLocationTagGroup(location, { ...tagGroup, children: newTags }).then(
        () => {
          saveTags(newTags, tgIndex);
        },
      );
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
    if (tagGroups[indexToGroup] && tagGroups[indexToGroup].readOnly) {
      showNotification(
        'Error move tag. Read only Tag Group: ' + tagGroups[indexToGroup].title,
        'error',
        true,
      );
      return;
    }
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
        if (!newTagLibrary[indexFromGroup].readOnly) {
          newTagLibrary[indexFromGroup].children = [
            ...newTagLibrary[indexFromGroup].children.slice(
              0,
              tagIndexForRemoving,
            ),
            ...newTagLibrary[indexFromGroup].children.slice(
              tagIndexForRemoving + 1,
            ),
          ];
        }
        const locationFrom: CommonLocation = newTagLibrary[indexFromGroup]
          .locationId
          ? findLocation(newTagLibrary[indexFromGroup].locationId)
          : undefined;

        const locationTo: CommonLocation = newTagLibrary[indexToGroup]
          .locationId
          ? findLocation(newTagLibrary[indexToGroup].locationId)
          : undefined;

        editLocationTagGroup(
          locationFrom,
          newTagLibrary[indexFromGroup],
          true,
        ).then(() => {
          editLocationTagGroup(
            locationTo,
            newTagLibrary[indexToGroup],
            true,
          ).then(() => {
            return saveTagLibrary(newTagLibrary);
          });
        });
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
              return {
                ...tagGroup,
                ...(location && {
                  locationId: location.uuid,
                }),
              };
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

  const openEditEntryTagDialog = useCallback(
    (entries: TS.FileSystemEntry[], tag: TS.Tag) => {
      setDialogState({ open: true, entries, tag });
    },
    [],
  );

  const closeEditEntryTagDialog = useCallback(() => {
    setDialogState({ open: false });
  }, []);

  const context = useMemo(() => {
    return {
      addTagsToFsEntries,
      addTags,
      addTagsToEntry,
      addTagsToFsEntry,
      editTagForEntry,
      removeTags,
      removeTagsFromEntry,
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
      {dialogState.open && (
        <EditEntryTagDialogAsync
          open={true}
          onClose={closeEditEntryTagDialog}
          tag={dialogState.tag}
          entries={dialogState.entries}
        />
      )}
      {children}
    </TaggingActionsContext.Provider>
  );
};
