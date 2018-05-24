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

import React from 'react';
import Tree, { TreeNode } from 'rc-tree';
import './index.less';
import { loadSubFolders } from '../../services/utils-io';

class TreeNav extends React.Component {
  constructor() {
    super();

    this.state = {
      selectedKeys: '',
      treeData: [],
      checkedKeys: []
    };

    this.onSelect = this.onSelect.bind(this);
    // this.onCheck = this.onCheck.bind(this);
    this.onLoadData = this.onLoadData.bind(this);
  }

  componentDidMount() {
    loadSubFolders(this.props.locationRootPath).then((rootDirContent) => {
      this.setState({
        treeData: rootDirContent
      });
      return true;
    }).catch((error) => {
      console.log('Error listing directory ' + error);
    });
  }

  componentWillReceiveProps(nextProps) {
    loadSubFolders(nextProps.locationRootPath).then((rootDirContent) => {
      this.setState({
        treeData: rootDirContent
      });
      return true;
    }).catch((error) => {
      console.log('Error listing directory ' + error);
    });
  }

  onSelect = (info, event) => {
    this.props.loadDirectoryContent(event.node.props.path);
    this.setState({ selectedKeys: info });
    // console.log('selected tree path', e.node.props.path );
  };

  onRightClick = (info) => {
    // console.log('right click', info, event);
    this.setState({ selectedKeys: [info.node.props.eventKey] });
    const selectedPath = info.node.props.path;
    this.props.handleDirectoryContextMenu(info.event, selectedPath);
  };

  /* onCheck = (checkedKeys) => {
    console.log(checkedKeys);
    this.setState({
      checkedKeys
    });
  }; */

  onLoadData = (treeNode) => new Promise((resolve) => {
    const level = treeNode.props.eventKey.split('-').length + 1;
    // console.log('Level ' + level);
    loadSubFolders(treeNode.props.path).then((dirContent) => {
      const treeData = [...this.state.treeData];
      for (let i = 0; i < dirContent.length; i++) {
        dirContent[i].key = treeNode.props.eventKey + '-' + i;
      }
      getNewTreeData(treeData, treeNode.props.eventKey, dirContent, level);
      this.setState({ treeData }, resolve());
      return true;
    }).catch((error) => {
      console.log('Error listing directory ' + error);
    });
  });

  render() {
    const loop = (data) => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            title={item.name}
            path={item.path}
            key={item.key}
            isLeaf={false}
          >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          title={item.name}
          path={item.path}
          key={item.key}
          isLeaf={false}
        />
      );
    });
    const treeNodes = loop(this.state.treeData);
    return (
      <div>
        <Tree
          onRightClick={this.onRightClick}
          disableCheckbox={true}
          showIcon={false}
          checkable={false}
          onSelect={this.onSelect}
          checkedKeys={this.state.checkedKeys}
          loadData={this.onLoadData}
        >
          {treeNodes}
        </Tree>
      </div>
    );
  }
}

/*
function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach((item) => {
      if ((item.key.length > curKey.length) ? item.key.indexOf(curKey) !== 0 :
        curKey.indexOf(item.key) !== 0) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children, l);
      } else if (l < 1) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData, level + 1);
} */

function getNewTreeData(treeData, curKey, children, level) {
  const loop = (tData) => {
    // if (level < 1 || curKey.length - 3 > level * 2) return;
    tData.forEach((item) => {
      if (curKey.indexOf(item.key) === 0) {
        if (item.children) {
          loop(item.children);
        } else {
          item.children = children;
        }
      }
    });
  };
  loop(treeData);
  // setLeaf(treeData, curKey, level);
}

export default TreeNav;
