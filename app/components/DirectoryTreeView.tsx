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

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Table from 'rc-table';
import FolderIcon from '@material-ui/icons/FolderOpen';
import { Location } from '-/reducers/locations';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from '-/components/DragItemTypes';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-io';

interface Props {
  classes: any;
  loadDirectoryContent: (path: string) => void;
  location: Location;
  data?: any;
  isReadOnlyMode?: boolean;
  showUnixHiddenEntries: boolean;
  showNotification?: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  handleFileMoveDrop: (item, monitor) => void;
}

const DirectoryTreeView = forwardRef((props: Props, ref) => {
  const [data, setData] = useState(undefined);
  const [isExpanded, setExpanded] = useState(false);

  useImperativeHandle(ref, () => ({
    changeLocation(location: Location) {
      if (isExpanded && data[location.uuid] !== undefined) {
        /*const dirsTree = data;
        dirsTree[location.uuid] = undefined;
        setData(dirsTree);*/
        //setData(undefined);
        setExpanded(false);
      } else {
        loadSubDirectories(location, 1);
      }
    },
    closeLocation() {
      setData(undefined);
    }
  }));

  /*const changeLocation = (location: Location) => {
    const dirsTree = data;
    dirsTree[location.uuid] = undefined;
    setData(dirsTree);
  };*/

  const renderBodyCell = props => (
    <td {...props}>
      <TargetMoveFileBox
        // @ts-ignore
        accepts={[DragItemTypes.FILE]}
        onDrop={props.handleFileMoveDrop}
      >
        {props.children}
      </TargetMoveFileBox>
    </td>
  );

  const renderNameColumnAction = field => {
    const children = (
      <span style={{ fontSize: 15, marginLeft: 5 }} title={field}>
        <FolderIcon
          style={{ marginTop: 0, marginBottom: -8 }}
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

  /*const onExpand = (expanded, record) => {
    // console.log('onExpand', expanded + JSON.stringify(record));
    if (expanded) {
      // this.onRowClick(record);
      loadSubDirectories(record, 1);
    }
  };*/

  const onRowClick = subDir => {
    loadSubDirectories(subDir, 1);
    props.loadDirectoryContent(subDir.path);
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

  const loadSubDirectories = (location: Location, deepLevel: number) => {
    const subFolder = {
      uuid: location.uuid,
      name: location.name,
      path: location.path || location.paths[0]
    };
    getDirectoriesTree(subFolder, deepLevel)
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
    uuid: string;
    name: string;
    path: string;
    children?: Array<SubFolder>;
  };

  const getDirectoriesTree = (subFolder: SubFolder, deepLevel: number) =>
    // const { settings } = getState();
    PlatformIO.listDirectoryPromise(subFolder.path, false)
      // @ts-ignore
      .then(dirEntries => {
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
            entry.uuid = subFolder.uuid;
            directoryContent.push(entry);
          }
          return true;
        });
        if (directoryContent.length > 0) {
          // eslint-disable-next-line no-param-reassign
          subFolder.children = directoryContent;
          if (deepLevel > 0) {
            const promisesArr = [];
            directoryContent.map(directory =>
              promisesArr.push(getDirectoriesTree(directory, deepLevel - 1))
            );
            return Promise.all(promisesArr);
          }
        }
        return subFolder;
      })
      .catch(error => {
        console.log('getDirectoriesTree', error);
      });

  /**
   * https://codereview.stackexchange.com/questions/47932/recursion-vs-iteration-of-tree-structure
   * Dynamically set property of nested object
   * */
  const getMergedDirsCopy = (path: string, arrChildren: Array<SubFolder>) => {
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
                  propPath: (stackPath ? stackPath + '.' : '') + i + '.children'
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
      // @ts-ignore
      <Table
        //key={props.location.uuid}
        // defaultExpandAllRows
        // className={classes.locationListArea}
        components={{
          // header: { cell: this.renderHeaderRow },
          body: { cell: renderBodyCell }
        }}
        showHeader={false}
        // className="table"
        rowKey="path"
        data={data[props.location.uuid]}
        columns={columns}
        className="table"
        // expandedRowRender={this.expandedRowRender}
        //onExpand={onExpand}
        // expandIcon={this.CustomExpandIcon}
        // expandIconAsCell
        /* onRow={(record, index) => ({
          onClick: this.onRowClick.bind(null, record, index),
        })} */
      />
    );
  }
  return null;
});

export default DirectoryTreeView;
