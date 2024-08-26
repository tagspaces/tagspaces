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

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppConfig from '-/AppConfig';
import TagContainerDnd from './TagContainerDnd';
import TagContainer from './TagContainer';
import ConfirmDialog from './dialogs/ConfirmDialog';
import CreateTagGroupDialog from './dialogs/CreateTagGroupDialog';
import CreateTagsDialog from './dialogs/CreateTagsDialog';
import EditTagGroupDialog from './dialogs/EditTagGroupDialog';
import TagGroupContainer from './TagGroupContainer';
import TagMenu from './menus/TagMenu';
import TagLibraryMenu from './menus/TagLibraryMenu';
import TagGroupMenu from './menus/TagGroupMenu';
import {
  actions as SettingsActions,
  getSaveTagInLocation,
  getTagColor,
  getTagGroupCollapsed,
  getTagTextColor,
} from '../reducers/settings';
import { AppDispatch } from '-/reducers/app';
import SmartTags from '../reducers/smart-tags';
import EditTagDialog from '-/components/dialogs/EditTagDialog';
import { TS } from '-/tagspaces.namespace';
import TagGroupTitleDnD from '-/components/TagGroupTitleDnD';
import { getAllTags, getTagLibrary } from '-/services/taglibrary-utils';
import { classes, SidePanel } from '-/components/SidePanels.css';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { Pro } from '-/pro';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import useFirstRender from '-/utils/useFirstRender';

interface Props {
  style?: any;
  reduceHeightBy: number;
}

function TagLibrary(props: Props) {
  const { t } = useTranslation();
  const {
    addTags,
    createTagGroup,
    removeTagGroup,
    deleteTag,
    changeTagOrder,
    moveTag,
    moveTagGroup,
    importTagGroups,
  } = useTaggingActionsContext();
  const { getTagGroups } = useTagGroupsLocationContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { readOnlyMode, findLocation, locations } = useCurrentLocationContext();
  const { tagGroups, reflectTagLibraryChanged } = useEditedTagLibraryContext();
  const dispatch: AppDispatch = useDispatch();
  const tagBackgroundColor = useSelector(getTagColor);
  const tagTextColor = useSelector(getTagTextColor);
  const tagGroupCollapsed: Array<string> = useSelector(getTagGroupCollapsed);
  //const locations: Array<CommonLocation> = useSelector(getLocations);

  const toggleTagGroupDispatch = (uuid) =>
    dispatch(SettingsActions.toggleTagGroup(uuid));
  const [tagGroupMenuAnchorEl, setTagGroupMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [tagLibraryMenuAnchorEl, setTagLibraryMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedTagGroupEntry, setSelectedTagGroupEntry] =
    useState<TS.TagGroup>(null);
  const [selectedTag, setSelectedTag] = useState<TS.Tag>(null);
  const [isCreateTagGroupDialogOpened, setIsCreateTagGroupDialogOpened] =
    useState<boolean>(false);
  const [isEditTagGroupDialogOpened, setIsEditTagGroupDialogOpened] =
    useState<boolean>(false);
  const [isDeleteTagGroupDialogOpened, setIsDeleteTagGroupDialogOpened] =
    useState<boolean>(false);
  const [isCreateTagDialogOpened, setIsCreateTagDialogOpened] =
    useState<boolean>(false);
  const [isEditTagDialogOpened, setIsEditTagDialogOpened] =
    useState<boolean>(false);
  const [isDeleteTagDialogOpened, setIsDeleteTagDialogOpened] =
    useState<boolean>(false);
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const firstRender = useFirstRender();

  const isTagLibraryReadOnly =
    window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

  useEffect(() => {
    if (Pro && saveTagInLocation && firstRender) {
      refreshTagsFromLocation();
    }
  }, [saveTagInLocation]);

  function refreshTagsFromLocation() {
    if (locations && locations.length > 0) {
      for (const location of locations) {
        getTagGroups(location).then((locationTagGroups) => {
          if (locationTagGroups && locationTagGroups.length > 0) {
            const oldGroups = getTagLibrary();
            if (checkTagGroupModified(locationTagGroups, oldGroups)) {
              importTagGroups(locationTagGroups, false, location);
              // } else {
              //   // refresh if localStorage is changed - from new instance
              //   reflectTagLibraryChanged(oldGroups);
            }
          }
        });
      }
    }
  }

  function checkTagGroupModified(
    newGroups: Array<TS.TagGroup>,
    oldGroups: Array<TS.TagGroup>,
  ) {
    return !newGroups.every((newGroup) =>
      oldGroups.some(
        (oldGroup) =>
          newGroup.uuid === oldGroup.uuid &&
          newGroup.modified_date <= oldGroup.modified_date,
      ),
    );
  }

  const handleTagGroupMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tagGroup,
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
      tagGroup: TS.TagGroup,
      haveSelectedEntries: boolean,
    ) => {
      handleTagMenu(event, tag, tagGroup, haveSelectedEntries);
    },
    [],
  );

  const handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag,
    tagGroup: TS.TagGroup,
    haveSelectedEntries: boolean,
  ) => {
    // if (!tagGroup.readOnly) { Smart Tags are readonly but needs to have TagMenu
    const isSmartTag = tag.functionality && tag.functionality.length > 0;
    if (!isSmartTag || haveSelectedEntries) {
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
      tagGroupCollapsed && tagGroupCollapsed.includes(tagGroup.uuid)
    );

    return (
      <div key={tagGroup.uuid}>
        <TagGroupTitleDnD
          index={index}
          tagGroup={tagGroup}
          moveTagGroup={(tagGroupUuid, position) => {
            moveTagGroup(tagGroupUuid, position);
          }}
          handleTagGroupMenu={handleTagGroupMenu}
          toggleTagGroup={toggleTagGroupDispatch}
          tagGroupCollapsed={tagGroupCollapsed}
          isReadOnly={tagGroup.readOnly || isTagLibraryReadOnly}
        />
        <Collapse in={tagGroup.expanded} unmountOnExit>
          <TagGroupContainer taggroup={tagGroup}>
            {tagGroup.children &&
              tagGroup.children.map((tag: TS.Tag, idx) => {
                if (readOnlyMode) {
                  return (
                    <TagContainer
                      key={tagGroup.uuid + tag.title}
                      tag={tag}
                      tagGroup={tagGroup}
                      handleTagMenu={handleTagMenuCallback}
                      addTags={addTags}
                      /*moveTag={(
                        tagTitle: string,
                        fromTagGroupId: TS.Uuid,
                        toTagGroupId: TS.Uuid
                      ) =>
                        moveTag(
                          tagTitle,
                          fromTagGroupId,
                          toTagGroupId,
                          tagGroups
                        )
                      }*/
                    />
                  );
                }
                return (
                  <TagContainerDnd
                    key={tagGroup.uuid + tag.title}
                    // tagContainerRef={tagContainerRef}
                    index={idx}
                    tag={tag}
                    tagGroup={tagGroup}
                    handleTagMenu={handleTagMenuCallback}
                    addTags={addTags}
                    moveTag={(
                      tagTitle: string,
                      fromTagGroupId: TS.Uuid,
                      toTagGroupId: TS.Uuid,
                    ) => moveTag(tagTitle, fromTagGroupId, toTagGroupId)}
                    changeTagOrder={(
                      tagGroupUuid: TS.Uuid,
                      fromIndex: number,
                      toIndex: number,
                    ) => changeTagOrder(tagGroupUuid, fromIndex, toIndex)}
                    selectedEntries={selectedEntries}
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
      deleteTag(selectedTag.title, selectedTagGroupEntry.uuid);
    }
  }

  const { reduceHeightBy } = props;

  const allTags = getAllTags(tagGroups);
  return (
    <SidePanel
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
          {t('core:tagLibrary')}
        </Typography>
        {!isTagLibraryReadOnly && (
          <IconButton
            data-tid="tagLibraryMenu"
            onClick={handleTagLibraryMenu}
            size="large"
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </div>
      {isDeleteTagGroupDialogOpened && (
        <ConfirmDialog
          open={isDeleteTagGroupDialogOpened}
          onClose={() => setIsDeleteTagGroupDialogOpened(false)}
          title={t('core:deleteTagGroup')}
          content={t('core:deleteTagGroupContentConfirm', {
            tagGroup: selectedTagGroupEntry ? selectedTagGroupEntry.title : '',
          })}
          confirmCallback={(result) => {
            if (result && selectedTagGroupEntry) {
              removeTagGroup(selectedTagGroupEntry.uuid);
            }
          }}
          cancelDialogTID="cancelDeleteTagGroupDialog"
          confirmDialogTID="confirmDeleteTagGroupDialog"
        />
      )}
      {isCreateTagGroupDialogOpened && (
        <CreateTagGroupDialog
          open={isCreateTagGroupDialogOpened}
          onClose={() => setIsCreateTagGroupDialogOpened(false)}
          createTagGroup={(entry: TS.TagGroup) => {
            const location: CommonLocation = findLocation(entry.locationId);
            if (location) {
              createTagGroup(entry, location);
            } else {
              createTagGroup(entry);
            }
          }}
          color={tagBackgroundColor}
          textcolor={tagTextColor}
        />
      )}
      {isCreateTagDialogOpened && (
        <CreateTagsDialog
          open={isCreateTagDialogOpened}
          onClose={() => setIsCreateTagDialogOpened(false)}
          selectedTagGroupEntry={selectedTagGroupEntry}
        />
      )}
      {isEditTagGroupDialogOpened && (
        <EditTagGroupDialog
          open={isEditTagGroupDialogOpened}
          onClose={() => setIsEditTagGroupDialogOpened(false)}
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
        />
      )}
      <TagLibraryMenu
        anchorEl={tagLibraryMenuAnchorEl}
        open={Boolean(tagLibraryMenuAnchorEl)}
        onClose={() => setTagLibraryMenuAnchorEl(null)}
        showCreateTagGroupDialog={showCreateTagGroupDialog}
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
          selectedTagGroupEntry={selectedTagGroupEntry}
          selectedTag={selectedTag}
        />
      )}
      {isDeleteTagDialogOpened && (
        <ConfirmDialog
          open={isDeleteTagDialogOpened}
          onClose={() => setIsDeleteTagDialogOpened(false)}
          title={t('core:deleteTagFromTagGroup')}
          content={t('core:deleteTagFromTagGroupContentConfirm', {
            tagName: selectedTag ? selectedTag.title : '',
          })}
          confirmCallback={(result) => {
            if (result) {
              confirmDeleteTag();
            }
          }}
          cancelDialogTID="cancelDeleteTagDialogTagMenu"
          confirmDialogTID="confirmDeleteTagDialogTagMenu"
        />
      )}
      <div
        style={{
          paddingTop: 0,
          marginTop: 0,
          borderRadius: 5,
          height: 'calc(100% - ' + reduceHeightBy + 'px)',
          width: 310,
          overflowY: 'auto',
        }}
        data-tid="tagLibraryTagGroupList"
      >
        {AppConfig.showSmartTags && (
          <div style={{ paddingTop: 0, paddingBottom: 0 }}>
            {SmartTags(t).map(renderTagGroup)}
          </div>
        )}
        <div style={{ paddingTop: 0 }}>{tagGroups.map(renderTagGroup)}</div>
      </div>
    </SidePanel>
  );
}

export default TagLibrary;
