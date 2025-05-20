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

import React, { createContext, useEffect, useMemo } from 'react';
import { TS } from '-/tagspaces.namespace';
import { getDescriptionPreview, mergeFsEntryMeta } from '-/services/utils-io';
import {
  getMetaDirectoryPath,
  getMetaFileLocationForDir,
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import versionMeta from '-/version.json';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelector } from 'react-redux';
import { getSaveTagInLocation } from '-/reducers/settings';
import { CommonLocation } from '-/utils/CommonLocation';
import { getTagLibrary } from '-/services/taglibrary-utils';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import useFirstRender from '-/utils/useFirstRender';

type TagGroupsLocationContextData = {
  getTagGroups: (location: CommonLocation) => Promise<TS.TagGroup[]>;
  createLocationTagGroup: (
    location: CommonLocation,
    tagGroup: TS.TagGroup,
  ) => Promise<TS.FileSystemEntryMeta>;
  editLocationTagGroup: (
    location: CommonLocation,
    tagGroup: TS.TagGroup,
    replaceTags?,
  ) => Promise<TS.FileSystemEntryMeta>;
  removeLocationTagGroup: (
    location: CommonLocation,
    tagGroupUuid: string,
  ) => Promise<TS.FileSystemEntryMeta>;
  mergeLocationTagGroup: (
    location: CommonLocation,
    tagGroup: TS.TagGroup,
  ) => Promise<TS.FileSystemEntryMeta>;
  loadLocationDataPromise: (
    location: CommonLocation,
    metaFile?,
  ) => Promise<TS.FileSystemEntryMeta>;
  getTagsFromLocations: () => Promise<TagGroupsByLocation>;
};

export const TagGroupsLocationContext =
  createContext<TagGroupsLocationContextData>({
    getTagGroups: undefined,
    createLocationTagGroup: undefined,
    editLocationTagGroup: undefined,
    removeLocationTagGroup: undefined,
    mergeLocationTagGroup: undefined,
    loadLocationDataPromise: undefined,
    getTagsFromLocations: undefined,
  });

export type TagGroupsByLocation = Record<string, TS.TagGroup[]>;
export type TagGroupsLocationContextProviderProps = {
  children: React.ReactNode;
};

export const TagGroupsLocationContextProvider = ({
  children,
}: TagGroupsLocationContextProviderProps) => {
  const { createDirectoryPromise, saveTextFilePromise } =
    usePlatformFacadeContext();

  const { locations } = useCurrentLocationContext();

  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  /*const firstRender = useFirstRender();

  useEffect(() => {
    if (Pro && saveTagInLocation && firstRender) {
      refreshTagsFromLocation();
    }
  }, [saveTagInLocation]);

  function refreshTagsFromLocation() {
    getTagsFromLocations().then((locationTagGroups: TagGroupsByLocation) => {
      for (const [uuid, groups] of Object.entries(locationTagGroups)) {
        //console.log(`Location ${uuid} has`, groups);
        const tGroups: TS.TagGroup[] = groups.map(group => ({...group,locationId: uuid}));
        tagGroups.current = [...tagGroups.current,...tGroups];
      }
      forceUpdate();
    })
  }*/
  /*useEffect(() => {
    if (currentLocation) {
      getTagGroups(currentLocation.path).then((groups) => {
        if (groups && groups.length > 0) {
          tagGroups.current = groups.map((group) => ({
            ...group,
            locationID: currentLocation.uuid,
          }));
        }
      });
    }
  }, [currentLocation]);*/

  async function getTagsFromLocations(): Promise<TagGroupsByLocation> {
    const result: TagGroupsByLocation = {};

    if (locations && locations.length > 0) {
      const allFetches = locations.map(async (location) => {
        const groups = await getTagGroups(location);
        if (groups && groups.length > 0) {
          result[location.uuid] = groups;
        }
      });

      await Promise.all(allFetches);
    }

    return result;
  }

  function getTagGroups(location: CommonLocation): Promise<TS.TagGroup[]> {
    return loadLocationDataPromise(location).then(
      (fsEntryMeta: TS.FileSystemEntryMeta) => {
        if (fsEntryMeta) {
          return fsEntryMeta.tagGroups;
        }
        return undefined;
      },
    );
  }

  async function loadLocationDataPromise(
    location: CommonLocation,
    metaFile = AppConfig.folderLocationsFile,
  ): Promise<TS.FileSystemEntryMeta> {
    if (saveTagInLocation) {
      //const entryProperties = await location.getPropertiesPromise(location.path);
      //if (!entryProperties.isFile) {
      const metaFilePath = getMetaFileLocationForDir(
        location.path,
        location.getDirSeparator(),
        metaFile,
      );
      return location.loadJSONFile(metaFilePath);
      /*const metaData = await location.loadJSONFile(metaFilePath);
      if (metaData) {
        return {
          ...metaData,
          description: getDescriptionPreview(metaData.description, 200),
        };
      }*/
    }
    return Promise.resolve(undefined);
  }

  function createLocationTagGroup(
    location: CommonLocation,
    tagGroup: TS.TagGroup,
  ): Promise<TS.FileSystemEntryMeta> {
    if (!saveTagInLocation || !Pro || !location) {
      return Promise.resolve(undefined);
    }
    return loadLocationDataPromise(location)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        let tagGroups;
        if (
          fsEntryMeta &&
          fsEntryMeta.tagGroups &&
          fsEntryMeta.tagGroups.length > 0
        ) {
          tagGroups = [
            ...fsEntryMeta.tagGroups.filter((tg) => tg.uuid !== tagGroup.uuid),
            tagGroup,
          ];
          //tagGroups = [...fsEntryMeta.tagGroups, tagGroup];
        } else {
          tagGroups = [tagGroup];
        }
        const updatedEntryMeta: TS.FileSystemEntryMeta = {
          ...(fsEntryMeta && fsEntryMeta),
          tagGroups,
        };
        return saveLocationDataPromise(location, updatedEntryMeta)
          .then(() => {
            return updatedEntryMeta;
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      })
      .catch(() => {
        const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
          tagGroups: [tagGroup],
        });
        return saveLocationDataPromise(location, newFsEntryMeta)
          .then(() => {
            return newFsEntryMeta;
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      });
  }

  function editLocationTagGroup(
    location: CommonLocation,
    tagGroup: TS.TagGroup,
    replaceTags = false,
  ): Promise<TS.FileSystemEntryMeta> {
    if (!saveTagInLocation || !Pro || !location) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
      loadLocationDataPromise(location)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          const oldTagGroup = fsEntryMeta.tagGroups.find(
            (group) => group.uuid === tagGroup.uuid,
          );

          let tagGroups;
          if (!oldTagGroup) {
            // add new tag group
            tagGroups = [...fsEntryMeta.tagGroups, tagGroup];
          } else {
            let tags = tagGroup.children;
            if (!replaceTags) {
              oldTagGroup.children.forEach((oldTag) => {
                // filter out duplicated tags
                tags = tags.filter((t) => t.title !== oldTag.title);
              });
              tags = [...oldTagGroup.children, ...tags];
            }

            const newTagGroup = {
              ...tagGroup,
              children: tags,
            };
            if (fsEntryMeta.tagGroups && fsEntryMeta.tagGroups.length > 0) {
              tagGroups = [
                ...fsEntryMeta.tagGroups.filter(
                  (group) => group.uuid !== tagGroup.uuid,
                ),
                newTagGroup,
              ];
            } else {
              tagGroups = [newTagGroup];
            }
          }
          const updatedEntryMeta: TS.FileSystemEntryMeta = {
            ...fsEntryMeta,
            tagGroups,
          };
          saveLocationDataPromise(location, updatedEntryMeta)
            .then(() => {
              resolve(updatedEntryMeta);
              return true;
            })
            .catch((err) => {
              console.log('Error ' + location.path + ' with ' + err);
              reject();
            });
          return true;
        })
        .catch(() => {
          const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
            tagGroups: [tagGroup],
          });
          saveLocationDataPromise(location, newFsEntryMeta)
            .then(() => {
              resolve(newFsEntryMeta);
              return true;
            })
            .catch((error) => {
              console.log('Error ' + location.path + ' with ' + error);
              reject();
            });
        });
    });
  }

  function removeLocationTagGroup(
    location: CommonLocation,
    tagGroupUuid: string,
  ): Promise<TS.FileSystemEntryMeta> {
    if (!saveTagInLocation || !Pro || !location) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
      loadLocationDataPromise(location)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          if (fsEntryMeta) {
            const tagGroups = fsEntryMeta.tagGroups?.filter(
              (group) => group.uuid !== tagGroupUuid,
            );
            if (tagGroups) {
              const updatedEntryMeta: TS.FileSystemEntryMeta = {
                ...fsEntryMeta,
                tagGroups,
              };
              return saveLocationDataPromise(location, updatedEntryMeta)
                .then(() => {
                  resolve(updatedEntryMeta);
                  return true;
                })
                .catch((err) => {
                  console.log('Error ' + location.path + ' with ' + err);
                  reject();
                  return false;
                });
            }
          }
          return true;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  function mergeLocationTagGroup(
    location: CommonLocation,
    tagGroup: TS.TagGroup,
  ): Promise<TS.FileSystemEntryMeta> {
    if (!saveTagInLocation || !Pro || !location) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve, reject) => {
      loadLocationDataPromise(location)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          const oldTagGroup = fsEntryMeta.tagGroups.find(
            (group) => group.uuid === tagGroup.uuid,
          );
          const newTagGroup = { ...tagGroup, children: oldTagGroup.children };
          let tagGroups;
          if (fsEntryMeta.tagGroups && fsEntryMeta.tagGroups.length > 0) {
            tagGroups = [...fsEntryMeta.tagGroups, newTagGroup];
          } else {
            tagGroups = [newTagGroup];
          }
          const updatedEntryMeta: TS.FileSystemEntryMeta = {
            ...fsEntryMeta,
            tagGroups,
          };
          saveLocationDataPromise(location, updatedEntryMeta)
            .then(() => {
              resolve(updatedEntryMeta);
              return true;
            })
            .catch((err) => {
              console.log('Error ' + location.path + ' with ' + err);
              reject();
            });
          return true;
        })
        .catch(() => {
          const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
            tagGroups: [tagGroup],
          });
          saveLocationDataPromise(location, newFsEntryMeta)
            .then(() => {
              resolve(newFsEntryMeta);
              return true;
            })
            .catch((error) => {
              console.log('Error ' + location.path + ' with ' + error);
              reject();
            });
        });
    });
  }

  async function saveLocationDataPromise(
    location: CommonLocation,
    metaData: any,
  ): Promise<any> {
    if (!saveTagInLocation || !location) {
      return Promise.resolve(undefined);
    }
    // const entryProperties = await location.getPropertiesPromise(location.path);
    // if (entryProperties) {
    let metaFilePath;
    // if (!entryProperties.isFile) {
    // check and create meta folder if not exist
    // todo not need to check if folder exist first createDirectoryPromise() recursively will skip creation of existing folders https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
    const metaDirectoryPath = getMetaDirectoryPath(
      location.path,
      location.getDirSeparator(),
    );
    const metaDirectoryProperties =
      await location.getPropertiesPromise(metaDirectoryPath);
    if (!metaDirectoryProperties) {
      await createDirectoryPromise(metaDirectoryPath, location.uuid, false);
    }

    metaFilePath = getMetaFileLocationForDir(
      location.path,
      location.getDirSeparator(),
      AppConfig.folderLocationsFile,
    );
    //}
    const content = JSON.stringify(
      {
        ...metaData,
        appName: versionMeta.name,
        appVersion: versionMeta.version,
        lastUpdated: new Date().toJSON(),
      },
      null,
      2,
    );
    return saveTextFilePromise(
      { path: metaFilePath, locationID: location.uuid },
      content,
      true,
    );
    // }
    // return Promise.reject(new Error('file not found' + path));
  }

  const context = useMemo(() => {
    return {
      //locationTagGroups: tagGroups.current,
      getTagGroups,
      createLocationTagGroup,
      editLocationTagGroup,
      removeLocationTagGroup,
      mergeLocationTagGroup,
      loadLocationDataPromise,
      getTagsFromLocations,
    };
  }, [saveTagInLocation]);

  return (
    <TagGroupsLocationContext.Provider value={context}>
      {children}
    </TagGroupsLocationContext.Provider>
  );
};
