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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import LocalOffer from '@material-ui/icons/LocalOffer';
// import ImportExportIcon from '@material-ui/icons/ImportExport';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Edit from '@material-ui/icons/Edit';
import SortByAlpha from '@material-ui/icons/SortByAlpha';
import DeleteForever from '@material-ui/icons/DeleteForever';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
// import { Toolbar } from '@material-ui/core/Toolbar';
import TagContainerDnd from './TagContainerDnd';
import ConfirmDialog from './dialogs/ConfirmDialog';
import styles from './SidePanels.css';
import CreateTagGroupDialog from './dialogs/CreateTagGroupDialog';
import CreateTagsDialog from './dialogs/CreateTagsDialog';
import EditTagGroupDialog from './dialogs/EditTagGroupDialog';
import TagGroupContainer from './TagGroupContainer';
import TagMenu from './menus/TagMenu';
import CustomLogo from './CustomLogo';
import TagLibraryMenu from './menus/TagLibraryMenu';
import {
  type TagGroup,
  type Tag,
  actions as TagLibraryActions,
  getTagGroups
} from '../reducers/taglibrary';
import TaggingActions from '../reducers/tagging-actions';
import i18n from '../services/i18n';
import { getTagColor, getTagTextColor } from '../reducers/settings';

type Props = {
  classes: Object,
  style: Object,
  tagTextColor: string,
  tagBackgroundColor: string,
  tagGroups: Array<TagGroup>,
  toggleTagGroup: (expanded: boolean, uuid: string) => void,
  removeTagGroup: (uuid: string) => void,
  moveTagGroupUp: (uuid: string) => void,
  moveTagGroupDown: (uuid: string) => void,
  sortTagGroup: (uuid: string) => void,
  addTags: () => void,
  importTagGroups: () => void,
  exportTagGroups: () => void,
  toggleTagGroup: () => void,
  createTagGroup: () => void,
  addTag: () => void,
  moveTag: () => void,
  editTagGroup: () => void,
  editTag: () => void,
  deleteTag: () => void
};

type State = {
  importExportMenuAnchorEl?: Object | null,
  importExportMenuOpened?: boolean,
  tagGroupMenuAnchorEl?: Object | null,
  tagGroupMenuOpened?: boolean,
  tagMenuAnchorEl?: Object,
  tagMenuOpened?: boolean,
  selectedTagEntry?: TagGroup | null,
  selectedTag?: Tag,
  selectedTagGroupEntry?: TagGroup,
  isCreateTagGroupDialogOpened?: boolean,
  isEditTagGroupDialogOpened?: boolean,
  isDeleteTagGroupDialogOpened?: boolean,
  isCreateTagDialogOpened?: boolean,
  isEditTagDialogOpened?: boolean,
  isDeleteTagDialogOpened?: boolean
};

class TagLibrary extends React.Component<Props, State> {
  state = {
    tagGroupMenuAnchorEl: null,
    tagGroupMenuOpened: false,
    tagMenuAnchorEl: undefined,
    tagMenuOpened: false,
    importExportMenuAnchorEl: null,
    importExportMenuOpened: false,
    selectedTagGroupEntry: undefined,
    selectedTag: undefined,
    isCreateTagGroupDialogOpened: false,
    isEditTagGroupDialogOpened: false,
    isDeleteTagGroupDialogOpened: false,
    isCreateTagDialogOpened: false,
    isEditTagDialogOpened: false,
    isDeleteTagDialogOpened: false
  };

  handleCloseDialogs = () => {
    this.setState({
      isCreateLocationDialogOpened: false,
      isEditLocationDialogOpened: false,
      isDeleteLocationDialogOpened: false,
      isDeleteDirectoryDialogOpened: false,
      isCreateDirectoryDialogOpened: false,
      isRenameDirectoryDialogOpened: false
    });
  };

  handleTagGroupTitleClick = (event: Object, tagGroup) => {
    this.props.toggleTagGroup(tagGroup.expanded, tagGroup.uuid);
  };

  handleTagGroupMenu = (event: Object, tagGroup) => {
    this.setState({
      tagGroupMenuOpened: true,
      tagGroupMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup
    });
  };

  handleTagMenu = (event: Object, tag, tagGroup) => {
    this.setState({
      tagMenuOpened: true,
      tagMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup,
      selectedTag: tag
    });
  };

  handleTagLibraryMenu = (event: Object) => {
    this.setState({
      importExportMenuOpened: true,
      importExportMenuAnchorEl: event.currentTarget
    });
  };

  showCreateTagGroupDialog = () => {
    this.setState({ isCreateTagGroupDialogOpened: true });
  };

  showCreateTagsDialog = () => {
    this.setState({ isCreateTagDialogOpened: true });
    this.handleCloseTagGroupMenu();
  };

  showEditTagGroupDialog = () => {
    this.setState({ isEditTagGroupDialogOpened: true });
    this.handleCloseTagGroupMenu();
  };

  showDeleteTagGroupDialog = () => {
    this.setState({ isDeleteTagGroupDialogOpened: true });
    this.handleCloseTagGroupMenu();
  };

  moveTagGroupUp = () => {
    if (this.state.selectedTagGroupEntry) {
      this.props.moveTagGroupUp(this.state.selectedTagGroupEntry.uuid);
    }
    this.handleCloseTagGroupMenu();
  };

  moveTagGroupDown = () => {
    if (this.state.selectedTagGroupEntry) {
      this.props.moveTagGroupDown(this.state.selectedTagGroupEntry.uuid);
    }
    this.handleCloseTagGroupMenu();
  };

  sortTagGroup = () => {
    if (this.state.selectedTagGroupEntry) {
      this.props.sortTagGroup(this.state.selectedTagGroupEntry.uuid);
    }
    this.handleCloseTagGroupMenu();
  };

  handleCloseDialogs = () => {
    this.setState({
      isCreateTagGroupDialogOpened: false,
      isEditTagGroupDialogOpened: false,
      isDeleteTagGroupDialogOpened: false,
      isCreateTagDialogOpened: false,
      isEditTagDialogOpened: false,
      isDeleteTagDialogOpened: false
    });
  };

  handleCloseTagGroupMenu = () => {
    this.setState({
      tagGroupMenuOpened: false
    });
  };

  handleCloseTagMenu = () => {
    this.setState({
      tagMenuOpened: false
    });
  };

  handleCloseImportExportMenu = () => {
    this.setState({ importExportMenuOpened: false });
  };

  renderTagGroup = tagGroup => (
    <div key={tagGroup.uuid}>
      <ListItem
        data-tid="tagLibraryTagGroupTitleClick"
        button
        style={{ maxWidth: 250 }}
        className={this.props.classes.listItem}
        onClick={event => this.handleTagGroupTitleClick(event, tagGroup)}
        onContextMenu={event => this.handleTagGroupMenu(event, tagGroup)}
      >
        <ListItemIcon style={{ marginRight: 0 }}>
          {tagGroup.expanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
        </ListItemIcon>
        <Typography
          variant="inherit"
          className={this.props.classes.header}
          style={{ paddingLeft: 0 }}
          data-tid="locationTitleElement"
          noWrap
        >
          {tagGroup.title}
        </Typography>
        <ListItemSecondaryAction>
          <IconButton
            aria-label={i18n.t('core:options')}
            aria-haspopup="true"
            data-tid={'tagLibraryMoreButton_' + tagGroup.title.replace(/ /g,'_')}
            style={{ marginRight: -4 }}
            onClick={event => this.handleTagGroupMenu(event, tagGroup)}
            onContextMenu={event => this.handleTagGroupMenu(event, tagGroup)}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={tagGroup.expanded} unmountOnExit style={{ maxWidth: 250 }}>
        <TagGroupContainer taggroup={tagGroup} data-tid={'tagGroupContainer_' + tagGroup.title}>
          {tagGroup.children && tagGroup.children.map((tag: Tag) => (
            <TagContainerDnd
              key={tag.id}
              tag={tag}
              tagGroup={tagGroup}
              handleTagMenu={this.handleTagMenu}
              addTags={this.props.addTags}
              moveTag={this.props.moveTag}
              deleteTag={this.props.deleteTag}
            />
          ))}
        </TagGroupContainer>
      </Collapse>
    </div>
  );

  render() {
    const classes = this.props.classes;
    const { tagGroups } = this.props;

    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <div className={classes.toolbar}>
          <Typography className={classes.panelTitle} type="subtitle1">
            {i18n.t('core:tagLibrary')}
          </Typography>
          <IconButton
            style={{ paddingTop: 0 }}
            data-tid="tagLibraryMenu"
            onClick={this.handleTagLibraryMenu}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
        <ConfirmDialog
          open={this.state.isDeleteTagGroupDialogOpened}
          onClose={this.handleCloseDialogs}
          title={i18n.t('core:deleteTagGroup')}
          content={i18n.t('core:deleteTagGroupContentConfirm', {
            tagGroup: this.state.selectedTagGroupEntry
              ? this.state.selectedTagGroupEntry.title
              : ''
          })}
          confirmCallback={result => {
            if (result && this.state.selectedTagGroupEntry) {
              this.props.removeTagGroup(this.state.selectedTagGroupEntry.uuid);
            }
          }}
          cancelDialogTID={'cancelDeleteTagGroupDialog'}
          confirmDialogTID={'confirmDeleteTagGroupDialog'}
        />
        <CreateTagGroupDialog
          open={this.state.isCreateTagGroupDialogOpened}
          onClose={this.handleCloseDialogs}
          createTagGroup={this.props.createTagGroup}
          color={this.props.tagBackgroundColor}
          textcolor={this.props.tagTextColor}
        />
        <CreateTagsDialog
          open={this.state.isCreateTagDialogOpened}
          onClose={this.handleCloseDialogs}
          addTag={this.props.addTag}
          selectedTagGroupEntry={this.state.selectedTagGroupEntry}
        />
        <EditTagGroupDialog
          open={this.state.isEditTagGroupDialogOpened}
          onClose={this.handleCloseDialogs}
          editTagGroup={this.props.editTagGroup}
          selectedTagGroupEntry={this.state.selectedTagGroupEntry}
        />
        <Menu
          anchorEl={this.state.tagGroupMenuAnchorEl}
          open={this.state.tagGroupMenuOpened}
          onClose={this.handleCloseTagGroupMenu}
        >
          <MenuItem data-tid="createTags" onClick={this.showCreateTagsDialog}>
            <ListItemIcon>
              <LocalOffer />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:addTags')} />
          </MenuItem>
          <MenuItem
            data-tid="editTagGroup"
            onClick={this.showEditTagGroupDialog}
          >
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:editTagGroup')} />
          </MenuItem>
          <MenuItem data-tid="moveTagGroupUp" onClick={this.moveTagGroupUp}>
            <ListItemIcon>
              <ArrowUpward />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:moveTagGroupUp')} />
          </MenuItem>
          <MenuItem data-tid="moveTagGroupDown" onClick={this.moveTagGroupDown}>
            <ListItemIcon>
              <ArrowDownward />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:moveTagGroupDown')} />
          </MenuItem>
          <MenuItem data-tid="sortTagGroup" onClick={this.sortTagGroup}>
            <ListItemIcon>
              <SortByAlpha />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:sortTagGroup')} />
          </MenuItem>
          <MenuItem
            data-tid="deleteTagGroup"
            onClick={this.showDeleteTagGroupDialog}
          >
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:deleteTagGroup')} />
          </MenuItem>
        </Menu>
        <TagLibraryMenu
          anchorEl={this.state.importExportMenuAnchorEl}
          open={this.state.importExportMenuOpened}
          onClose={this.handleCloseImportExportMenu}
          tagGroups={tagGroups}
          importTagGroups={this.props.importTagGroups}
          exportTagGroups={this.props.exportTagGroups}
          showCreateTagGroupDialog={this.showCreateTagGroupDialog}
          toggleTagGroup={this.props.toggleTagGroup}
        />
        <TagMenu
          anchorEl={this.state.tagMenuAnchorEl}
          open={this.state.tagMenuOpened}
          onClose={this.handleCloseTagMenu}
          selectedTagGroupEntry={this.state.selectedTagGroupEntry}
          selectedTag={this.state.selectedTag}
          editTag={this.props.editTag}
          deleteTag={this.props.deleteTag}
        />
        <div className={classes.taggroupsArea} data-tid="tagLibraryTagGroupList">
          <List style={{ paddingTop: 0 }}>{tagGroups.map(this.renderTagGroup)}</List>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tagGroups: getTagGroups(state),
    tagBackgroundColor: getTagColor(state),
    tagTextColor: getTagTextColor(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...TagLibraryActions, addTags: TaggingActions.addTags }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(TagLibrary)
);
