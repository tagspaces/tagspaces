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
import { CommonLocation } from '-/utils/CommonLocation';
import { alpha, useTheme } from '@mui/material/styles';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import Table from 'rc-table';
import {
  Ref,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';

interface Props {
  location: CommonLocation;
  handleFileMoveDrop: (item, monitor) => void;
}

export interface DirectoryTreeViewRef {
  changeLocation: (location: CommonLocation) => void;
  closeLocation: () => void;
}

// Re‐declare SubFolder with explicit types
interface SubFolder {
  accessKeyId?: string;
  bucketName?: string;
  region?: string;
  endpointURL?: string;
  secretAccessKey?: string;

  uuid: string;
  name: string;
  type: string;
  path: string;

  children?: SubFolder[];
}

const DirectoryTreeView = forwardRef(
  (props: Props, ref: Ref<DirectoryTreeViewRef>) => {
    const theme = useTheme();
    const { location, handleFileMoveDrop } = props;
    const { openDirectory } = useDirectoryContentContext();
    const { findLocation, changeLocation, getLocationPath, currentLocationId } =
      useCurrentLocationContext();

    // data is a map from location.uuid → SubFolder[]
    const [data, setData] = useState<Record<string, SubFolder[]> | undefined>(
      undefined,
    );
    const [isExpanded, setExpanded] = useState(false);
    const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
    //const dispatch: AppDispatch = useDispatch();

    // When currentLocationId changes refresh `data`
    useEffect(() => {
      if (data && currentLocationId === location.uuid) {
        setData(undefined);
      }
    }, [currentLocationId]);

    // initially loadSubDirectories or whenever data was just cleared from previous useEffect
    useEffect(() => {
      if (data === undefined && currentLocationId === location.uuid) {
        loadSubDirectories(location);
      }
    }, [data, currentLocationId]);

    useImperativeHandle(ref, () => ({
      changeLocation(newLocation: CommonLocation) {
        if (currentLocationId === undefined) {
          changeLocation(newLocation, true);
        }
        if (isExpanded) {
          // Collapse (or clear) if already expanded
          //setData(undefined);
          setExpanded(false);
        } else if (data && data[newLocation.uuid] !== undefined) {
          //if (newLocation.uuid === currentLocationId) {
          setData(undefined);
        } else {
          loadSubDirectories(newLocation);
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
      if (AppConfig.isElectron || location.type !== locationType.TYPE_CLOUD) {
        // DnD to S3 location is not permitted in web browser without <input> element
        return (
          <TargetFileBox
            accepts={[FILE]}
            directoryPath={location.path}
            locationId={location.uuid}
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
      return <tr {...propsRow} />;
    };

    const renderNameColumnAction = (field: string) => {
      const children = (
        <span style={{ fontSize: 15 }} title={field}>
          <FolderOutlineIcon
            style={{
              marginTop: 0,
              marginLeft: 3,
              marginRight: 6,
              marginBottom: -8,
            }}
          />
          {field.length > 25 ? field.substr(0, 25) + '...' : field}
        </span>
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

    const onExpand = (expanded: boolean, record) => {
      if (expanded) {
        // this.onRowClick(record);
        loadSubDirectories(record);
      }
    };

    const onRowClick = (subDir: SubFolder) => {
      const foundLoc = findLocation(subDir.uuid);
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

    const loadSubDirectories = (loc: CommonLocation) => {
      getLocationPath(loc).then((locationPath) => {
        const subFolder: SubFolder = {
          ...(loc.accessKeyId && { accessKeyId: loc.accessKeyId }),
          ...(loc.bucketName && { bucketName: loc.bucketName }),
          ...(loc.region && { region: loc.region }),
          ...(loc.endpointURL && { endpointURL: loc.endpointURL }),
          ...(loc.secretAccessKey && { secretAccessKey: loc.secretAccessKey }),
          uuid: loc.uuid,
          name: loc.name,
          type: loc.type,
          path: locationPath,
          children: [], // will be overwritten
        };
        getDirectoriesTree(subFolder)
          .then((children) => {
            if (Array.isArray(children)) {
              if (loc.uuid) {
                // Build a new `data` map just for this one location.uuid
                let newDirsArray: SubFolder[] | undefined = undefined;

                // If this is first expansion, data===undefined → use children directly
                if (!data) {
                  // !loc.path) {
                  newDirsArray = children;
                } else {
                  // Try to merge under an existing subtree
                  const merged = getMergedDirsCopy(loc.path, children);
                  if (merged) {
                    newDirsArray = merged;
                  } else {
                    // No existing match → just put `loc` with its new `children`
                    subFolder.children = children;
                    newDirsArray = [subFolder];
                  }
                }

                if (newDirsArray) {
                  setData({ [loc.uuid]: newDirsArray });
                  setExpanded(true);
                }
              }
            }
          })
          .catch((error) => {
            console.error('loadSubDirectories error:', error);
          });
      });
    };

    const getDirectoriesTree = (subFolder: SubFolder) =>
      // const { settings } = getState();
      new Promise((resolve, reject) => {
        findLocation(subFolder.uuid)
          .listDirectoryPromise(subFolder.path, [])
          .then((dirEntries) => {
            if (dirEntries !== undefined) {
              // console.debug('listDirectoryPromise resolved:' + dirEntries.length);
              const directoryContent = [];
              dirEntries.map((entry) => {
                if (
                  entry.name === AppConfig.metaFolder ||
                  entry.name.endsWith('/' + AppConfig.metaFolder) ||
                  (!showUnixHiddenEntries && entry.name.startsWith('.'))
                ) {
                  return true;
                }
                // const enhancedEntry = enhanceEntry(entry);
                if (!entry.isFile) {
                  // eslint-disable-next-line no-param-reassign
                  if (subFolder.accessKeyId) {
                    entry.accessKeyId = subFolder.accessKeyId;
                  }
                  if (subFolder.bucketName) {
                    entry.bucketName = subFolder.bucketName;
                  }
                  if (subFolder.region) {
                    entry.region = subFolder.region;
                  }
                  if (subFolder.endpointURL) {
                    entry.endpointURL = subFolder.endpointURL;
                  }
                  if (subFolder.secretAccessKey) {
                    entry.secretAccessKey = subFolder.secretAccessKey;
                  }
                  entry.uuid = subFolder.uuid;
                  entry.type = subFolder.type;
                  entry.children = []; // assuming there are sub folders
                  directoryContent.push(entry);
                }
                return true;
              });
              resolve(directoryContent);
            }
          })
          .catch((error) => {
            console.debug('getDirectoriesTree', error);
            reject();
          });
      });
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
          key={location.uuid}
          style={{
            borderRadius: AppConfig.defaultCSSRadius,
            backgroundColor: alpha(theme.palette.grey.A400, 0.2),
            marginTop: 5,
            marginBottom: 5,
          }}
          components={{
            // header: { cell: this.renderHeaderRow },
            body: { row: renderBodyRow },
          }}
          showHeader={false}
          // className="table"
          rowKey="path"
          data={data[location.uuid]}
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
