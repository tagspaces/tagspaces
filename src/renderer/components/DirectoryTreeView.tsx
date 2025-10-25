/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { FolderOutlineIcon } from '-/components/CommonIcons';
import CustomDragLayer from '-/components/CustomDragLayer';
import DragItemTypes from '-/components/DragItemTypes';
import TargetFileBox from '-/components/TargetFileBox';
import TargetTableMoveFileBox from '-/components/TargetTableMoveFileBox';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import { resolveRelativePath } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { cleanTrailingDirSeparator } from '@tagspaces/tagspaces-common/paths';
import Table from 'rc-table';
import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';

interface Props {
  location: SubFolder;
  handleFileMoveDrop: (item, monitor) => void;
}

export interface DirectoryTreeViewRef {
  changeLocation: (location: SubFolder) => void;
  closeLocation: () => void;
}

// Re‐declare SubFolder with explicit types
export interface SubFolder extends TS.FileSystemEntry {
  /* accessKeyId?: string;
  bucketName?: string;
  region?: string;
  endpointURL?: string;
  secretAccessKey?: string;

  uuid: string;
  name: string;
  path: string;
  type: string; */
  children?: SubFolder[];
}

const DirectoryTreeView = forwardRef(
  (props: Props, ref: Ref<DirectoryTreeViewRef>) => {
    const theme = useTheme();
    const { location, handleFileMoveDrop } = props;
    const { openDirectory, currentDirectoryEntries, currentDirectoryPath } =
      useDirectoryContentContext();
    const { findLocation, changeLocation, currentLocationId } =
      useCurrentLocationContext();

    // data is a map from location.uuid → SubFolder[]
    const [data, setData] = useState<Record<string, SubFolder[]> | undefined>(
      undefined,
    );
    const [isExpanded, setExpanded] = useState(false);
    const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
    //const dispatch: AppDispatch = useDispatch();

    // When currentLocationId changes refresh `data`
    /*useEffect(() => {
      if (data && currentLocationId === location.locationID) {
        setData(undefined);
      }
    }, [currentLocationId]);*/

    // initially loadSubDirectories or whenever data was just cleared from previous useEffect
    useEffect(() => {
      if (
        data === undefined &&
        currentLocationId === location.locationID &&
        currentDirectoryEntries?.length > 0
      ) {
        if (
          currentDirectoryEntries[0].locationID === location.locationID &&
          cleanTrailingDirSeparator(currentDirectoryPath) ===
            cleanTrailingDirSeparator(location.path)
        ) {
          attachNewChildren(
            {
              isFile: false,
              lmdt: 0,
              name: location.name,
              path: currentDirectoryPath,
              size: 0,
              locationID: location.locationID,
              children: [],
            },
            processDirs(
              currentDirectoryEntries,
              location.locationID,
              showUnixHiddenEntries,
            ),
          );
        }
        //loadSubDirectories(location);
      } else if (!currentLocationId) {
        setData(undefined);
        if (isExpanded) {
          setExpanded(false);
        }
      }
    }, [data, currentLocationId, currentDirectoryEntries]);

    useImperativeHandle(ref, () => ({
      changeLocation(newLocation: SubFolder) {
        if (currentLocationId === undefined) {
          changeLocation(findLocation(newLocation.locationID), true);
        }
        if (isExpanded) {
          // Collapse (and clear) if already expanded
          setData({ [newLocation.uuid]: undefined });
          setExpanded(false);
        } else {
          loadSubDirectories({
            isFile: false,
            lmdt: 0,
            name: newLocation.name,
            path: newLocation.path,
            size: 0,
            locationID: newLocation.locationID,
            children: [],
          });
        }
      },
      closeLocation() {
        setData(undefined);
        if (isExpanded) {
          setExpanded(false);
        }
      },
    }));

    const { FILE } = NativeTypes;

    const renderBodyRow = (propsRow: any) => {
      const subFolderLocation = propsRow.location;
      if (subFolderLocation) {
        const loc = findLocation(subFolderLocation.locationID);
        if (AppConfig.isElectron || loc.type !== locationType.TYPE_CLOUD) {
          // DnD to S3 location is not permitted in web browser without <input> element
          return (
            <TargetFileBox
              accepts={[FILE]}
              directoryPath={subFolderLocation.path}
              locationId={subFolderLocation.locationID}
            >
              <CustomDragLayer />
              <TargetTableMoveFileBox
                accepts={[DragItemTypes.FILE]}
                onDrop={handleFileMoveDrop}
                {...propsRow}
              />
            </TargetFileBox>
          );
        }
      }
      return <tr {...propsRow} />;
    };

    const renderNameColumnAction = (field: string) => {
      const children = (
        <Box sx={{ fontSize: '15px', display: 'inline-block' }} title={field}>
          <FolderOutlineIcon
            sx={{
              marginTop: 0,
              marginLeft: '3px',
              marginRight: '6px',
              marginBottom: '-8px',
              display: 'inline-block',
            }}
          />
          {field.length > 25 ? field.substr(0, 25) + '...' : field}
        </Box>
      );
      return { children, props: {} };
    };

    const handleCellClick = (record: SubFolder, index: number) => ({
      onClick: () => {
        onRowClick(record);
      },
      /* onDoubleClick: (e) => {
      this.onRowClick(record, index, e);
    } */
    });

    const onExpand = (expanded: boolean, record: SubFolder) => {
      if (expanded) {
        // this.onRowClick(record);
        loadSubDirectories(record);
      }
    };

    const onRowClick = (subDir: SubFolder) => {
      const foundLoc = findLocation(subDir.locationID);
      if (foundLoc) {
        //changeLocation(foundLoc, true);
        openDirectory(subDir.path, undefined, foundLoc);
      }
    };

    const columns = [
      {
        title: undefined,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
        render: renderNameColumnAction,
        onCell: handleCellClick,
      },
    ];

    const loadSubDirectories = (sub: SubFolder) => {
      resolveRelativePath(sub.path).then((locationPath) => {
        getDirectoriesTree(locationPath, sub.locationID)
          .then((children) => {
            attachNewChildren(sub, children);
          })
          .catch((error) => {
            console.error('loadSubDirectories error:', error);
          });
      });
    };

    function attachNewChildren(sub: SubFolder, children: SubFolder[]) {
      if (Array.isArray(children)) {
        // Build a new `data` map just for this one location.uuid
        let newDirsArray: SubFolder[] | undefined = undefined;

        // If this is first expansion, data===undefined → use children directly
        if (!data || !data[sub.locationID]) {
          newDirsArray = children;
        } else {
          // Try to merge under an existing subtree
          const merged = getMergedDirsCopy(sub.path, children);
          if (merged) {
            newDirsArray = merged;
          } else {
            // No existing match → just put `loc` with its new `children`
            newDirsArray = [{ ...sub, children: children }]; //path: locationPath,
          }
        }

        if (newDirsArray) {
          setData({ [sub.locationID]: newDirsArray });
          setExpanded(true);
        }
      }
    }

    const getDirectoriesTree = (
      path: string,
      locationID: string,
    ): Promise<SubFolder[]> =>
      // const { settings } = getState();
      new Promise((resolve, reject) => {
        const loc = findLocation(locationID);
        loc
          .listDirectoryPromise(path, [])
          .then((dirEntries) => {
            if (dirEntries !== undefined) {
              // console.debug('listDirectoryPromise resolved:' + dirEntries.length);
              const directoryContent = processDirs(
                dirEntries,
                loc.uuid,
                showUnixHiddenEntries,
              );
              resolve(directoryContent);
            }
          })
          .catch((error) => {
            console.debug('getDirectoriesTree', error);
            reject(error);
          });
      });

    /**
     * Builds a flat SubFolder list from an array of FileSystemEntry,
     * keeping only "files" (not directories), skipping any hidden or meta-folder entries.
     *
     * @param entries             The array of FileSystemEntry; if undefined, returns [].
     * @param locationID          A locationID whose fields will be copied into each SubFolder.
     * @param showHiddenEntries   If false, skip any files whose name starts with a dot.
     * @returns                   An array of SubFolder objects (children always initialized to []).
     */
    function processDirs(
      entries: TS.FileSystemEntry[] | undefined,
      locationID: string,
      showHiddenEntries: boolean,
    ): SubFolder[] {
      // Early exit if entries is missing or empty
      if (!entries || entries.length === 0) {
        return [];
      }

      // Destructure the location so we don’t repeat 'loc.' everywhere
      /* const {
        uuid,
        type,
        accessKeyId,
        secretAccessKey,
        bucketName,
        region,
        endpointURL,
      } = loc;*/

      return (
        entries
          // 1) Keep only file entries
          .filter((entry) => !entry.isFile)
          // 2) Exclude any “meta” or hidden entries
          .filter((entry) => {
            const { name } = entry;

            // If hidden entries are disallowed and this name starts with '.'
            if (!showHiddenEntries) {
              // && name.startsWith('.')) {
              // Pull out the meta-folder name and "/metaFolder" once
              const metaFolderName = AppConfig.metaFolder;
              const metaSuffix = `/${metaFolderName}`;

              // If the base-name itself is exactly “metaFolderName”, skip it
              if (name === metaFolderName) {
                return false;
              }

              // If name ends with "/metaFolder", skip it.
              // (Only do this check if your FileSystemEntry.name actually includes a slash.)
              if (name.endsWith(metaSuffix)) {
                return false;
              }
            }

            return true;
          })
          // 3) Map each remaining FileSystemEntry to SubFolder
          .map((entry) => ({
            ...entry,
            locationID: locationID,
            children: [] as SubFolder[],
          }))
      );
    }

    /**
     * Returns an array of SubFolder, where the node with .path === targetPath
     * has its .children replaced by newChildren. Or `undefined` if no match.
     */
    function mergeChildrenAtPath(
      nodes: SubFolder[],
      targetPath: string,
      newChildren: SubFolder[],
    ): SubFolder[] | undefined {
      let didChange = false;

      const updatedNodes = nodes.map((node) => {
        // Direct match
        if (node.path === targetPath) {
          didChange = true;
          return {
            ...node,
            children: newChildren,
          };
        }

        // Recurse if it has children
        if (node.children && node.children.length > 0) {
          const mergedDesc = mergeChildrenAtPath(
            node.children,
            targetPath,
            newChildren,
          );
          if (mergedDesc) {
            didChange = true;
            return {
              ...node,
              children: mergedDesc,
            };
          }
        }

        // No change needed for this branch
        return node;
      });

      return didChange ? updatedNodes : undefined;
    }

    /**
     * If data is undefined → first‐time expand: return arrChildren directly.
     * Otherwise, try merging under each top‐level key in `data`.
     */
    function getMergedDirsCopy(
      pathToMatch: string,
      arrChildren: SubFolder[],
    ): SubFolder[] | undefined {
      for (const [uuidKey, subtree] of Object.entries(data)) {
        const newSubtree = mergeChildrenAtPath(
          subtree,
          pathToMatch,
          arrChildren,
        );
        if (newSubtree) {
          return newSubtree;
        }
      }
      return undefined;
    }

    if (isExpanded && data !== undefined) {
      return (
        <Table
          key={location.locationID}
          style={{
            borderRadius: AppConfig.defaultCSSRadius,
            backgroundColor: alpha(theme.palette.grey.A400, 0.2),
            marginTop: 0,
            marginBottom: 5,
          }}
          components={{
            // header: { cell: this.renderHeaderRow },
            body: { row: renderBodyRow },
          }}
          showHeader={false}
          // className="table"
          rowKey="path"
          data={data[location.locationID]}
          columns={columns}
          indentSize={20}
          expandable={{ onExpand }}
          // expandIcon={this.CustomExpandIcon}
          // expandIconAsCell
          // @ts-ignore
          onRow={(record, index) => ({
            index,
            location: record,
            handleFileMoveDrop: handleFileMoveDrop,
          })}
        />
      );
    }
    return null;
  },
);

export default DirectoryTreeView;
