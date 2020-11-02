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

import React from 'react';
import uuidv1 from 'uuid';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import TagContainerDnd from './TagContainerDnd';
import TagContainer from './TagContainer';
import ConfirmDialog from './dialogs/ConfirmDialog';
import styles from './SidePanels.css';
import CreateTagGroupDialog from './dialogs/CreateTagGroupDialog';
import CreateTagsDialog from './dialogs/CreateTagsDialog';
import EditTagGroupDialog from './dialogs/EditTagGroupDialog';
import TagGroupContainer from './TagGroupContainer';
import TagMenu from './menus/TagMenu';
import CustomLogo from './CustomLogo';
import TagLibraryMenu from './menus/TagLibraryMenu';
import TagGroupMenu from './menus/TagGroupMenu';
import {
  TagGroup,
  Tag,
  actions as TagLibraryActions,
  getAllTags,
  getTagGroups
} from '../reducers/taglibrary';
import TaggingActions from '../reducers/tagging-actions';
import i18n from '../services/i18n';
import { getTagColor, getTagTextColor } from '../reducers/settings';
import {
  actions as AppActions,
  getSelectedEntries,
  isReadOnlyMode
} from '../reducers/app';
import SmartTags from '../reducers/smart-tags';
import { FileSystemEntry } from '-/services/utils-io';

const isTagLibraryReadOnly =
  window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

interface Props {
  classes: any;
  style: any;
  isReadOnlyMode: boolean;
  tagTextColor: string;
  tagBackgroundColor: string;
  tagGroups: Array<TagGroup>;
  allTags: Array<Tag>;
  openURLExternally: (path: string) => void;
  toggleTagGroup: (expanded: boolean, uuid: string) => void;
  removeTagGroup: (uuid: string) => void;
  moveTagGroupUp: (uuid: string) => void;
  moveTagGroupDown: (uuid: string) => void;
  sortTagGroup: (uuid: string) => void;
  collectTagsFromLocation: (tagGroup: TagGroup) => void;
  addTags: () => void;
  importTagGroups: () => void;
  exportTagGroups: () => void;
  createTagGroup: () => void;
  addTag: () => void;
  moveTag: () => void;
  editTagGroup: () => void;
  editTag: () => void;
  deleteTag: () => void;
  selectedEntries: Array<FileSystemEntry>;
}

interface State {
  tagLibraryMenuAnchorEl: Element;
  tagLibraryMenuOpened: boolean;
  tagGroupMenuAnchorEl: Element;
  tagGroupMenuOpened: boolean;
  tagMenuAnchorEl: Element;
  tagMenuOpened: boolean;
  selectedTagEntry: TagGroup;
  selectedTag: Tag;
  selectedTagGroupEntry: TagGroup;
  isCreateTagGroupDialogOpened: boolean;
  isEditTagGroupDialogOpened: boolean;
  isDeleteTagGroupDialogOpened: boolean;
  isCreateTagDialogOpened: boolean;
  isEditTagDialogOpened: boolean;
  isDeleteTagDialogOpened: boolean;
}

class TagLibrary extends React.Component<Props, State> {
  state = {
    tagGroupMenuAnchorEl: null,
    tagGroupMenuOpened: false,
    tagMenuAnchorEl: null,
    tagMenuOpened: false,
    tagLibraryMenuAnchorEl: null,
    tagLibraryMenuOpened: false,
    selectedTagGroupEntry: null,
    selectedTagEntry: null,
    selectedTag: null,
    isCreateTagGroupDialogOpened: false,
    isEditTagGroupDialogOpened: false,
    isDeleteTagGroupDialogOpened: false,
    isCreateTagDialogOpened: false,
    isEditTagDialogOpened: false,
    isDeleteTagDialogOpened: false
  };

  handleTagGroupTitleClick = (event: Object, tagGroup) => {
    this.props.toggleTagGroup(tagGroup.expanded, tagGroup.uuid);
  };

  handleTagGroupMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tagGroup
  ) => {
    this.setState({
      tagGroupMenuOpened: true,
      tagGroupMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup
    });
  };

  handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag,
    tagGroup: TagGroup
  ) => {
    this.setState({
      tagMenuOpened: true,
      tagMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup,
      selectedTag: tag
    });
  };

  handleTagLibraryMenu = (event: any) => {
    this.setState({
      tagLibraryMenuOpened: true,
      tagLibraryMenuAnchorEl: event.currentTarget
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
    this.setState({ tagLibraryMenuOpened: false });
  };

  renderTagGroup = tagGroup => {
    const isReadOnly = tagGroup.readOnly || isTagLibraryReadOnly;
    return (
      <div key={tagGroup.uuid}>
        <ListItem
          data-tid={'tagLibraryTagGroupTitle_' + tagGroup.title}
          button
          style={{ maxWidth: 250 }}
          className={this.props.classes.listItem}
          onClick={(event: any) =>
            this.handleTagGroupTitleClick(event, tagGroup)
          }
          onContextMenu={(event: any) =>
            this.handleTagGroupMenu(event, tagGroup)
          }
          title={
            'Number of tags in this tag group: ' + tagGroup.children.length
          }
        >
          <ListItemIcon style={{ minWidth: 'auto' }}>
            {tagGroup.expanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
          </ListItemIcon>
          <Typography
            variant="inherit"
            className={this.props.classes.header}
            style={{ paddingLeft: 0 }}
            data-tid="locationTitleElement"
            noWrap
          >
            {tagGroup.title + ' '}
            {!tagGroup.expanded && (
              <span className={this.props.classes.badge}>
                {tagGroup.children.length}
              </span>
            )}
          </Typography>
          {!isReadOnly && (
            <ListItemSecondaryAction>
              <IconButton
                aria-label={i18n.t('core:options')}
                aria-haspopup="true"
                edge="end"
                data-tid={
                  'tagLibraryMoreButton_' + tagGroup.title.replace(/ /g, '_')
                }
                onClick={(event: any) =>
                  this.handleTagGroupMenu(event, tagGroup)
                }
                onContextMenu={(event: any) =>
                  this.handleTagGroupMenu(event, tagGroup)
                }
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <Collapse in={tagGroup.expanded} unmountOnExit>
          <TagGroupContainer
            taggroup={tagGroup}
            data-tid={'tagGroupContainer_' + tagGroup.title}
          >
            {tagGroup.children &&
              tagGroup.children.map((tag: Tag) => {
                if (this.props.isReadOnlyMode) {
                  return (
                    <TagContainer
                      key={tagGroup.uuid + tag.title}
                      tag={tag}
                      tagGroup={tagGroup}
                      handleTagMenu={this.handleTagMenu}
                      addTags={this.props.addTags}
                      moveTag={this.props.moveTag}
                      selectedEntries={this.props.selectedEntries}
                    />
                  );
                }
                return (
                  <TagContainerDnd
                    key={tagGroup.uuid + tag.title}
                    tag={tag}
                    tagGroup={tagGroup}
                    handleTagMenu={this.handleTagMenu}
                    addTags={this.props.addTags}
                    moveTag={this.props.moveTag}
                    selectedEntries={this.props.selectedEntries}
                  />
                );
              })}
          </TagGroupContainer>
        </Collapse>
      </div>
    );
  };

  render() {
    const { tagGroups, classes, allTags } = this.props;

    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <div className={classes.toolbar}>
          <Typography
            className={classNames(classes.panelTitle, classes.header)}
            title={
              'Your tag library contains ' +
              allTags.length +
              ' tags \ndistributed in ' +
              tagGroups.length +
              ' tag groups'
            }
            variant="subtitle1"
          >
            {i18n.t('core:tagLibrary')}
          </Typography>
          {!isTagLibraryReadOnly && (
            <IconButton
              data-tid="tagLibraryMenu"
              onClick={this.handleTagLibraryMenu}
            >
              <MoreVertIcon />
            </IconButton>
          )}
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
          cancelDialogTID="cancelDeleteTagGroupDialog"
          confirmDialogTID="confirmDeleteTagGroupDialog"
        />
        <CreateTagGroupDialog
          key={uuidv1()}
          open={this.state.isCreateTagGroupDialogOpened}
          onClose={this.handleCloseDialogs}
          createTagGroup={this.props.createTagGroup}
          color={this.props.tagBackgroundColor}
          textcolor={this.props.tagTextColor}
        />
        <CreateTagsDialog
          key={uuidv1()}
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
        <TagGroupMenu
          anchorEl={this.state.tagGroupMenuAnchorEl}
          open={this.state.tagGroupMenuOpened}
          onClose={this.handleCloseTagGroupMenu}
          selectedTagGroupEntry={this.state.selectedTagGroupEntry}
          showCreateTagsDialog={this.showCreateTagsDialog}
          showDeleteTagGroupDialog={this.showDeleteTagGroupDialog}
          handleCloseTagGroupMenu={this.handleCloseTagGroupMenu}
          showEditTagGroupDialog={this.showEditTagGroupDialog}
          moveTagGroupUp={this.props.moveTagGroupUp}
          moveTagGroupDown={this.props.moveTagGroupDown}
          sortTagGroup={this.props.sortTagGroup}
          collectTagsFromLocation={this.props.collectTagsFromLocation}
        />
        <TagLibraryMenu
          anchorEl={this.state.tagLibraryMenuAnchorEl}
          open={this.state.tagLibraryMenuOpened}
          onClose={this.handleCloseImportExportMenu}
          tagGroups={tagGroups}
          importTagGroups={this.props.importTagGroups}
          exportTagGroups={this.props.exportTagGroups}
          showCreateTagGroupDialog={this.showCreateTagGroupDialog}
          openURLExternally={this.props.openURLExternally}
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
        <div
          className={classes.taggroupsArea}
          data-tid="tagLibraryTagGroupList"
        >
          <List style={{ paddingTop: 0 }}>
            {SmartTags(i18n).map(this.renderTagGroup)}
          </List>
          <List style={{ paddingTop: 0 }}>
            {tagGroups.map(this.renderTagGroup)}
          </List>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tagGroups: getTagGroups(state),
    tagBackgroundColor: getTagColor(state),
    tagTextColor: getTagTextColor(state),
    selectedEntries: getSelectedEntries(state),
    allTags: getAllTags(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleTagGroup: TagLibraryActions.toggleTagGroup,
      removeTagGroup: TagLibraryActions.removeTagGroup,
      moveTagGroupUp: TagLibraryActions.moveTagGroupUp,
      moveTagGroupDown: TagLibraryActions.moveTagGroupDown,
      sortTagGroup: TagLibraryActions.sortTagGroup,
      importTagGroups: TagLibraryActions.importTagGroups,
      exportTagGroups: TagLibraryActions.exportTagGroups,
      createTagGroup: TagLibraryActions.createTagGroup,
      editTag: TagLibraryActions.editTag,
      moveTag: TagLibraryActions.moveTag,
      editTagGroup: TagLibraryActions.editTagGroup,
      deleteTag: TagLibraryActions.deleteTag,
      addTag: TagLibraryActions.addTag,
      addTags: TaggingActions.addTags,
      collectTagsFromLocation: TaggingActions.collectTagsFromLocation,
      openURLExternally: AppActions.openURLExternally
    },
    dispatch
  );
}

export default withStyles(styles)(
  // @ts-ignore
  connect(mapStateToProps, mapDispatchToProps)(TagLibrary)
);
