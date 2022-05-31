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

import React, { useState, forwardRef, useImperativeHandle, Ref } from 'react';
import Table from 'rc-table';
import FolderIcon from '@material-ui/icons/FolderOpen';
import DragItemTypes from '-/components/DragItemTypes';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-facade';
import TargetTableMoveFileBox from '-/components/TargetTableMoveFileBox';
import { getLocationPath } from '-/utils/paths';
import { TS } from '-/tagspaces.namespace';
import { locationType } from '-/utils/misc';

interface Props {
  classes: any;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  location: TS.Location;
  data?: any;
  isReadOnlyMode?: boolean;
  showUnixHiddenEntries: boolean;
  showNotification?: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  handleFileMoveDrop: (item, monitor) => void;
  changeLocation: (loc: TS.Location) => void;
}

export interface DirectoryTreeViewRef {
  changeLocation: (location: TS.Location) => void;
  closeLocation: () => void;
  // removeLocation: () => void;
}

const DirectoryTreeView = forwardRef(
  (props: Props, ref: Ref<DirectoryTreeViewRef>) => {
    const [data, setData] = useState(undefined);
    const [isExpanded, setExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
      changeLocation(location: TS.Location) {
        if (isExpanded && data[location.uuid] !== undefined) {
          setData(undefined); // comment this to use cached data after expand
          setExpanded(false);
        } else {
          if (location.type === locationType.TYPE_CLOUD) {
            PlatformIO.enableObjectStoreSupport(location)
              .then(() => {
                loadSubDirectories(location);
              })
              .catch(error => {
                console.log('enableObjectStoreSupport', error);
              });
          } else if (location.type === locationType.TYPE_LOCAL) {
            PlatformIO.disableObjectStoreSupport();
            loadSubDirectories(location);
          }
        }
      },
      closeLocation() {
        setData(undefined);
        if (isExpanded) {
          setExpanded(false);
        }
      }
      /*removeLocation() {
        setData(undefined);
      }*/
    }));

    /*const changeLocation = (location: Location) => {
    const dirsTree = data;
    dirsTree[location.uuid] = undefined;
    setData(dirsTree);
  };*/

    /*const renderBodyCell = props => (
    <td {...props}>
      <TargetMoveFileBox
        // @ts-ignore
        accepts={[DragItemTypes.FILE]}
        onDrop={props.handleFileMoveDrop}
      >
        {props.children}
      </TargetMoveFileBox>
    </td>
  );*/

    const renderBodyRow = props => {
      if (
        AppConfig.isElectron ||
        props.location.type !== locationType.TYPE_CLOUD
      ) {
        // DnD to S3 location is not permitted in web browser without <input> element
        return (
          <TargetTableMoveFileBox
            accepts={[DragItemTypes.FILE]}
            onDrop={props.handleFileMoveDrop}
            location={props.location}
            {...props}
          />
        );
      } else {
        return <tr {...props} />;
      }
    };

    const renderNameColumnAction = field => {
      const children = (
        <span style={{ fontSize: 15 }} title={field}>
          <FolderIcon
            style={{
              marginTop: 0,
              marginLeft: 3,
              marginRight: 6,
              marginBottom: -8
            }}
            className={props.classes.icon}
          />
          {field && field.length > 25 ? field.substr(0, 25) + '...' : field}
        </span>
      );
      return {
        children,
        props: {}
      };
    };

    const handleCellClick = (record, index) => ({
      /* onContextMenu: (e) => {
      this.handleFileContextMenu(e, record.path);
    }, */
      onClick: () => {
        onRowClick(record);
      }
      /* onDoubleClick: (e) => {
      this.onRowClick(record, index, e);
    } */
    });

    const onExpand = (expanded, record) => {
      // console.log('onExpand', expanded + JSON.stringify(record));
      if (expanded) {
        // this.onRowClick(record);
        loadSubDirectories(record);
      }
    };

    const onRowClick = subDir => {
      if (subDir.type === locationType.TYPE_CLOUD) {
        PlatformIO.enableObjectStoreSupport(subDir)
          .then(() => {
            loadSubDirectories(subDir);
            props.changeLocation(subDir);
            props.loadDirectoryContent(subDir.path, true);
          })
          .catch(error => {
            console.log('enableObjectStoreSupport', error);
          });
      } else if (subDir.type === locationType.TYPE_LOCAL) {
        PlatformIO.disableObjectStoreSupport();
        loadSubDirectories(subDir);
        props.changeLocation(subDir);
        props.loadDirectoryContent(subDir.path, true);
      }
    };

    const columns = [
      {
        title: undefined,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
        render: renderNameColumnAction,
        onCell: handleCellClick
      }
    ];

    const loadSubDirectories = (location: TS.Location) => {
      const subFolder = {
        ...(location.accessKeyId && { accessKeyId: location.accessKeyId }),
        ...(location.bucketName && { bucketName: location.bucketName }),
        ...(location.region && { region: location.region }),
        ...(location.endpointURL && { endpointURL: location.endpointURL }),
        ...(location.secretAccessKey && {
          secretAccessKey: location.secretAccessKey
        }),
        uuid: location.uuid,
        name: location.name,
        type: location.type,
        path: getLocationPath(location)
      };
      getDirectoriesTree(subFolder)
        .then(children => {
          if (children instanceof Array) {
            if (location.uuid) {
              const dirsTree = {}; // this.state.dirs; (uncomment to allow open multiple Locations folders) //TODO set settings for this
              if (location.path === undefined) {
                // location
                dirsTree[location.uuid] = children;
              } else {
                const dirsCopy = getMergedDirsCopy(location.path, children);
                if (dirsCopy) {
                  dirsTree[location.uuid] = dirsCopy;
                } else {
                  // eslint-disable-next-line no-param-reassign
                  location.children = children;
                  dirsTree[location.uuid] = [location];
                }
              }
              setData(dirsTree);
              setExpanded(true);
            }
          } else if (location.path === undefined) {
            // if is Location
            //setData({});
          }
          return true;
        })
        .catch(error => {
          console.log('loadSubDirectories', error);
        });
    };

    type SubFolder = {
      accessKeyId?: string;
      bucketName?: string;
      region?: string;
      endpointURL?: string;
      secretAccessKey?: string;
      uuid: string;
      name: string;
      type: string;
      path: string;
      children?: Array<SubFolder>;
    };

    const getDirectoriesTree = (subFolder: SubFolder) => {
      // const { settings } = getState();
      return new Promise((resolve, reject) => {
        PlatformIO.listDirectoryPromise(subFolder.path, [])
          .then(dirEntries => {
            if (dirEntries !== undefined) {
              // console.debug('listDirectoryPromise resolved:' + dirEntries.length);
              const directoryContent = [];
              dirEntries.map(entry => {
                if (
                  entry.name === AppConfig.metaFolder ||
                  entry.name.endsWith('/' + AppConfig.metaFolder) ||
                  (!props.showUnixHiddenEntries && entry.name.startsWith('.'))
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
          .catch(error => {
            console.debug('getDirectoriesTree', error);
            reject();
          });
      });
    };

    /**
     * https://codereview.stackexchange.com/questions/47932/recursion-vs-iteration-of-tree-structure
     * Dynamically set property of nested object
     * */
    const getMergedDirsCopy = (path: string, arrChildren: Array<SubFolder>) => {
      if (!data) {
        return arrChildren;
      }
      const entries = Object.entries(data);
      for (const [uuid, arrSubDirs] of entries) {
        const arr: number = (arrSubDirs as Array<any>).length;
        let a;
        for (a = 0; a < arr; a += 1) {
          if (path === arrSubDirs[a].path) {
            const copyObj = [...data[uuid]];
            copyObj[a].children = arrChildren;
            return copyObj;
          }
          if (arrSubDirs[a].children !== undefined) {
            const stack = [
              {
                depth: 0,
                element: arrSubDirs[a],
                propPath: ''
              }
            ];
            let stackItem = 0;
            let current;
            let children;
            let depth;
            let stackPath;
            let propPath = a + '.children';

            while ((current = stack[stackItem++])) {
              // get the arguments
              stackPath = current.propPath;
              depth = current.depth;
              current = current.element;
              children = current.children;
              if (children !== undefined) {
                const len = children.length;
                for (let i = 0; i < len; i++) {
                  if (path === children[i].path) {
                    propPath =
                      propPath +
                      '.' +
                      (stackPath ? stackPath + '.' : '') +
                      i +
                      '.children';
                    const copyObj = [...data[uuid]];

                    let schema = copyObj; // a moving reference to internal objects within obj
                    const pList = propPath.split('.');
                    const leng = pList.length;
                    for (let c = 0; c < leng - 1; c++) {
                      const elem = pList[c];
                      if (!schema[elem]) schema[elem] = {};
                      schema = schema[elem];
                    }
                    schema[pList[leng - 1]] = arrChildren;
                    return copyObj;
                  }

                  stack.push({
                    // pass args via object or array
                    element: children[i],
                    depth: depth + 1,
                    propPath:
                      (stackPath ? stackPath + '.' : '') + i + '.children'
                  });
                }
              }
            }
          }
        }
      }
    };

    if (isExpanded && data != undefined) {
      return (
        <Table
          key={props.location.uuid}
          // defaultExpandAllRows
          // className={classes.locationListArea}
          components={{
            // header: { cell: this.renderHeaderRow },
            body: { row: renderBodyRow }
          }}
          showHeader={false}
          // className="table"
          rowKey="path"
          data={data[props.location.uuid]}
          columns={columns}
          indentSize={20}
          expandable={{ onExpand: onExpand }}
          // expandIcon={this.CustomExpandIcon}
          // expandIconAsCell
          // @ts-ignore
          onRow={(record, index) => ({
            index,
            location: record,
            handleFileMoveDrop: props.handleFileMoveDrop
          })}
        />
      );
    }
    return null;
  }
);

export default DirectoryTreeView;
