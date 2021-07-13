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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import MoreVertIcon from '@material-ui/icons/MoreVert';
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
  actions as TagLibraryActions,
  getAllTags,
  getTagGroups
} from '../reducers/taglibrary';
import TaggingActions from '../reducers/tagging-actions';
import i18n from '../services/i18n';
import {
  actions as SettingsActions,
  getTagColor,
  getTagTextColor
} from '../reducers/settings';
import {
  actions as AppActions,
  getSelectedEntries,
  isReadOnlyMode
} from '../reducers/app';
import SmartTags from '../reducers/smart-tags';
import { AppConfig } from '-/config';
import EditTagDialog from '-/components/dialogs/EditTagDialog';
import { TS } from '-/tagspaces.namespace';
import { getLocations } from '-/reducers/locations';
import { Pro } from '-/pro';
import TagGroupTitleDnD from '-/components/TagGroupTitleDnD';

interface Props {
  classes?: any;
  style?: any;
  isReadOnlyMode: boolean;
  tagTextColor: string;
  tagBackgroundColor: string;
  tagGroups: Array<TS.TagGroup>;
  allTags: Array<TS.Tag>;
  openURLExternally: (path: string) => void;
  toggleTagGroup: (uuid: string) => void;
  removeTagGroup: (uuid: string) => void;
  moveTagGroupUp: (uuid: string) => void;
  moveTagGroupDown: (uuid: string) => void;
  sortTagGroup: (uuid: string) => void;
  collectTagsFromLocation: (tagGroup: TS.TagGroup) => void;
  addTags: () => void;
  importTagGroups: (entries: Array<TS.TagGroup>, replace?: boolean) => void;
  exportTagGroups: () => void;
  createTagGroup: () => void;
  addTag: () => void;
  moveTag: () => void;
  changeTagOrder: (
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number
  ) => void;
  editTagGroup: () => void;
  editTag: () => void;
  deleteTag: (tagTitle: string, parentTagGroupUuid: TS.Uuid) => void;
  showNotification: (
    text: string,
    notificationType?: string, // NotificationTypes
    autohide?: boolean
  ) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  tagGroupCollapsed: Array<string>;
  locations: Array<TS.Location>;
  saveTagInLocation: boolean;
  moveTagGroup: (tagGroupUuid: TS.Uuid, position: number) => void;
}

const TagLibrary = (props: Props) => {
  const tagContainerRef = useRef<HTMLSpanElement>(null);
  const [
    tagGroupMenuAnchorEl,
    setTagGroupMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [
    tagLibraryMenuAnchorEl,
    setTagLibraryMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [selectedTagGroupEntry, setSelectedTagGroupEntry] = useState<
    TS.TagGroup
  >(null);
  // const [selectedTagEntry, setSelectedTagEntry] = useState<TagGroup>(null);
  const [selectedTag, setSelectedTag] = useState<TS.Tag>(null);
  const [
    isCreateTagGroupDialogOpened,
    setIsCreateTagGroupDialogOpened
  ] = useState<boolean>(false);
  const [isEditTagGroupDialogOpened, setIsEditTagGroupDialogOpened] = useState<
    boolean
  >(false);
  const [
    isDeleteTagGroupDialogOpened,
    setIsDeleteTagGroupDialogOpened
  ] = useState<boolean>(false);
  const [isCreateTagDialogOpened, setIsCreateTagDialogOpened] = useState<
    boolean
  >(false);
  const [isEditTagDialogOpened, setIsEditTagDialogOpened] = useState<boolean>(
    false
  );
  const [isDeleteTagDialogOpened, setIsDeleteTagDialogOpened] = useState<
    boolean
  >(false);

  useEffect(() => {
    if (Pro && props.saveTagInLocation) {
      refreshTagsFromLocation();
    }
  }, []);

  const refreshTagsFromLocation = () => {
    props.locations.map(location =>
      Pro.MetaOperations.getTagGroups(location.path)
        .then((tagGroups: Array<TS.TagGroup>) => {
          if (tagGroups && tagGroups.length > 0) {
            const newGroups = tagGroups.map(group => ({
              ...group,
              locationId: location.uuid
            }));
            props.importTagGroups(newGroups, false);
          }
          return true;
        })
        .catch(err => {
          console.error(err);
        })
    );
  };

  const isTagLibraryReadOnly =
    window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

  const handleTagGroupMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tagGroup
  ) => {
    setTagGroupMenuAnchorEl(event.currentTarget);
    setSelectedTagGroupEntry(tagGroup);
    /* this.setState({
      tagGroupMenuOpened: true,
      tagGroupMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup
    }); */
  };

  const handleTagMenuCallback = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      tag,
      tagGroup: TS.TagGroup
    ) => {
      handleTagMenu(event, tag, tagGroup);
    },
    []
  );

  const handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag,
    tagGroup: TS.TagGroup
  ) => {
    if (!tagGroup.readOnly) {
      setTagMenuAnchorEl(event.currentTarget);
      setSelectedTagGroupEntry(tagGroup);
      setSelectedTag(tag);
    }
  };

  const handleTagLibraryMenu = (event: any) => {
    setTagLibraryMenuAnchorEl(event.currentTarget);
    /* this.setState({
      tagLibraryMenuOpened: true,
      tagLibraryMenuAnchorEl: event.currentTarget
    }); */
  };

  const showCreateTagGroupDialog = () => {
    setIsCreateTagGroupDialogOpened(true);
    // this.setState({ isCreateTagGroupDialogOpened: true });
  };

  const showCreateTagsDialog = () => {
    setIsCreateTagDialogOpened(true);
    setTagGroupMenuAnchorEl(null);
  };

  const showEditTagGroupDialog = () => {
    setIsEditTagGroupDialogOpened(true);
    setTagGroupMenuAnchorEl(null);
  };

  const showDeleteTagGroupDialog = () => {
    setIsDeleteTagGroupDialogOpened(true);
    setTagGroupMenuAnchorEl(null);
  };

  const renderTagGroup = (tagGroup, index) => {
    // eslint-disable-next-line no-param-reassign
    tagGroup.expanded = !(
      props.tagGroupCollapsed && props.tagGroupCollapsed.includes(tagGroup.uuid)
    );
    const isReadOnly = tagGroup.readOnly || isTagLibraryReadOnly;
    return (
      <div key={tagGroup.uuid}>
        <TagGroupTitleDnD
          index={index}
          classes={classes}
          tagGroup={tagGroup}
          moveTagGroup={props.moveTagGroup}
          handleTagGroupMenu={handleTagGroupMenu}
          toggleTagGroup={props.toggleTagGroup}
          locations={props.locations}
          tagGroupCollapsed={props.tagGroupCollapsed}
          isReadOnly={isReadOnly}
        />
        <Collapse in={tagGroup.expanded} unmountOnExit>
          <TagGroupContainer
            taggroup={tagGroup}
            data-tid={'tagGroupContainer_' + tagGroup.title}
          >
            {tagGroup.children &&
              tagGroup.children.map((tag: TS.Tag, idx) => {
                if (props.isReadOnlyMode) {
                  return (
                    <TagContainer
                      key={tagGroup.uuid + tag.title}
                      tag={tag}
                      tagGroup={tagGroup}
                      handleTagMenu={handleTagMenuCallback}
                      addTags={props.addTags}
                      moveTag={props.moveTag}
                      selectedEntries={props.selectedEntries}
                    />
                  );
                }
                return (
                  <TagContainerDnd
                    key={tagGroup.uuid + tag.title}
                    tagContainerRef={tagContainerRef}
                    index={idx}
                    tag={tag}
                    tagGroup={tagGroup}
                    handleTagMenu={handleTagMenuCallback}
                    addTags={props.addTags}
                    moveTag={props.moveTag}
                    changeTagOrder={props.changeTagOrder}
                    selectedEntries={props.selectedEntries}
                  />
                );
              })}
          </TagGroupContainer>
        </Collapse>
      </div>
    );
  };

  function confirmDeleteTag() {
    if (selectedTag && selectedTagGroupEntry) {
      props.deleteTag(selectedTag.title, selectedTagGroupEntry.uuid);
    }
  }

  const { tagGroups, classes, allTags, showNotification } = props;

  return (
    <div className={classes.panel} style={props.style}>
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
          <IconButton data-tid="tagLibraryMenu" onClick={handleTagLibraryMenu}>
            <MoreVertIcon />
          </IconButton>
        )}
      </div>
      {isDeleteTagGroupDialogOpened && (
        <ConfirmDialog
          open={isDeleteTagGroupDialogOpened}
          onClose={() => setIsDeleteTagGroupDialogOpened(false)}
          title={i18n.t('core:deleteTagGroup')}
          content={i18n.t('core:deleteTagGroupContentConfirm', {
            tagGroup: selectedTagGroupEntry ? selectedTagGroupEntry.title : ''
          })}
          confirmCallback={result => {
            if (result && selectedTagGroupEntry) {
              props.removeTagGroup(selectedTagGroupEntry.uuid);
            }
          }}
          cancelDialogTID="cancelDeleteTagGroupDialog"
          confirmDialogTID="confirmDeleteTagGroupDialog"
        />
      )}
      {isCreateTagGroupDialogOpened && (
        <CreateTagGroupDialog
          // key={uuidv1()}
          open={isCreateTagGroupDialogOpened}
          onClose={() => setIsCreateTagGroupDialogOpened(false)}
          createTagGroup={props.createTagGroup}
          color={props.tagBackgroundColor}
          textcolor={props.tagTextColor}
        />
      )}
      {isCreateTagDialogOpened && (
        <CreateTagsDialog
          // key={uuidv1()}
          open={isCreateTagDialogOpened}
          onClose={() => setIsCreateTagDialogOpened(false)}
          addTag={props.addTag}
          selectedTagGroupEntry={selectedTagGroupEntry}
        />
      )}
      {isEditTagGroupDialogOpened && (
        <EditTagGroupDialog
          open={isEditTagGroupDialogOpened}
          onClose={() => setIsEditTagGroupDialogOpened(false)}
          editTagGroup={props.editTagGroup}
          selectedTagGroupEntry={selectedTagGroupEntry}
        />
      )}
      {Boolean(tagGroupMenuAnchorEl) && (
        <TagGroupMenu
          anchorEl={tagGroupMenuAnchorEl}
          open={Boolean(tagGroupMenuAnchorEl)}
          onClose={() => setTagGroupMenuAnchorEl(null)}
          selectedTagGroupEntry={selectedTagGroupEntry}
          showCreateTagsDialog={showCreateTagsDialog}
          showDeleteTagGroupDialog={showDeleteTagGroupDialog}
          handleCloseTagGroupMenu={() => setTagGroupMenuAnchorEl(null)}
          showEditTagGroupDialog={showEditTagGroupDialog}
          moveTagGroupUp={props.moveTagGroupUp}
          moveTagGroupDown={props.moveTagGroupDown}
          sortTagGroup={props.sortTagGroup}
          collectTagsFromLocation={props.collectTagsFromLocation}
        />
      )}
      <TagLibraryMenu
        anchorEl={tagLibraryMenuAnchorEl}
        open={Boolean(tagLibraryMenuAnchorEl)}
        onClose={() => setTagLibraryMenuAnchorEl(null)}
        tagGroups={tagGroups}
        importTagGroups={props.importTagGroups}
        exportTagGroups={props.exportTagGroups}
        showCreateTagGroupDialog={showCreateTagGroupDialog}
        showNotification={showNotification}
        openURLExternally={props.openURLExternally}
        saveTagInLocation={props.saveTagInLocation}
        refreshTagsFromLocation={refreshTagsFromLocation}
      />
      {Boolean(tagMenuAnchorEl) && (
        <TagMenu
          // key={'tag_' + selectedTag.path}
          anchorEl={tagMenuAnchorEl}
          open={Boolean(tagMenuAnchorEl)}
          onClose={() => setTagMenuAnchorEl(null)}
          showEditTagDialog={() => setIsEditTagDialogOpened(true)}
          showDeleteTagDialog={() => setIsDeleteTagDialogOpened(true)}
          selectedTag={selectedTag}
        />
      )}
      {isEditTagDialogOpened && (
        <EditTagDialog
          open={isEditTagDialogOpened}
          onClose={() => setIsEditTagDialogOpened(false)}
          editTag={props.editTag}
          selectedTagGroupEntry={selectedTagGroupEntry}
          selectedTag={selectedTag}
        />
      )}
      {isDeleteTagDialogOpened && (
        <ConfirmDialog
          open={isDeleteTagDialogOpened}
          onClose={() => setIsDeleteTagDialogOpened(false)}
          title={i18n.t('core:deleteTagFromTagGroup')}
          content={i18n.t('core:deleteTagFromTagGroupContentConfirm', {
            tagName: selectedTag ? selectedTag.title : ''
          })}
          confirmCallback={result => {
            if (result) {
              confirmDeleteTag();
            }
          }}
          cancelDialogTID="cancelDeleteTagDialogTagMenu"
          confirmDialogTID="confirmDeleteTagDialogTagMenu"
        />
      )}
      <div className={classes.taggroupsArea} data-tid="tagLibraryTagGroupList">
        {AppConfig.showSmartTags && (
          <div style={{ paddingTop: 0, paddingBottom: 0 }}>
            {SmartTags(i18n).map(renderTagGroup)}
          </div>
        )}
        <div style={{ paddingTop: 0 }}>{tagGroups.map(renderTagGroup)}</div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    tagGroups: getTagGroups(state),
    tagBackgroundColor: getTagColor(state),
    tagTextColor: getTagTextColor(state),
    selectedEntries: getSelectedEntries(state),
    allTags: getAllTags(state),
    isReadOnlyMode: isReadOnlyMode(state),
    tagGroupCollapsed: state.settings.tagGroupCollapsed,
    locations: getLocations(state),
    saveTagInLocation: state.settings.saveTagInLocation
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleTagGroup: SettingsActions.toggleTagGroup,
      removeTagGroup: TagLibraryActions.removeTagGroup,
      moveTagGroupUp: TagLibraryActions.moveTagGroupUp,
      moveTagGroup: TagLibraryActions.moveTagGroup,
      moveTagGroupDown: TagLibraryActions.moveTagGroupDown,
      sortTagGroup: TagLibraryActions.sortTagGroup,
      importTagGroups: TagLibraryActions.importTagGroups,
      exportTagGroups: TagLibraryActions.exportTagGroups,
      createTagGroup: TagLibraryActions.createTagGroup,
      editTag: TagLibraryActions.editTag,
      moveTag: TagLibraryActions.moveTag,
      changeTagOrder: TagLibraryActions.changeTagOrder,
      editTagGroup: TagLibraryActions.editTagGroup,
      deleteTag: TagLibraryActions.deleteTag,
      addTag: TagLibraryActions.addTag,
      addTags: TaggingActions.addTags,
      collectTagsFromLocation: TaggingActions.collectTagsFromLocation,
      openURLExternally: AppActions.openURLExternally,
      showNotification: AppActions.showNotification
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(TagLibrary));
