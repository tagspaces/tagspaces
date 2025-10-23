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
import { MoreMenuIcon } from '-/components/CommonIcons';
import CustomDragLayer from '-/components/CustomDragLayer';
import SidePanelTitle from '-/components/SidePanelTitle';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagGroupContainer from '-/components/TagGroupContainer';
import TagGroupTitleDnD from '-/components/TagGroupTitleDnD';
import TsIconButton from '-/components/TsIconButton';
import CreateTagGroupDialog from '-/components/dialogs/CreateTagGroupDialog';
import CreateTagsDialog from '-/components/dialogs/CreateTagsDialog';
import EditTagDialog from '-/components/dialogs/EditTagDialog';
import EditTagGroupDialog from '-/components/dialogs/EditTagGroupDialog';
import TagGroupMenu from '-/components/menus/TagGroupMenu';
import TagLibraryMenu from '-/components/menus/TagLibraryMenu';
import TagMenu from '-/components/menus/TagMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getSaveTagInLocation,
  getTagColor,
  getTagGroupCollapsed,
  getTagTextColor,
} from '-/reducers/settings';
import SmartTags from '-/reducers/smart-tags';
import { getAllTags } from '-/services/taglibrary-utils';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { Box, Collapse } from '@mui/material';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  reduceHeightBy: number;
}

function TagLibrary({ reduceHeightBy }: Props) {
  const { t } = useTranslation();
  const {
    createTagGroup,
    removeTagGroup,
    changeTagOrder,
    moveTag,
    moveTagGroup,
  } = useTaggingActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { findLocation } = useCurrentLocationContext();
  const { tagGroups } = useEditedTagLibraryContext();
  const { openConfirmDialog } = useNotificationContext();
  const [wSpaceTagGroups, setWSpaceTagGroups] =
    useState<TS.TagGroup[]>(tagGroups);
  const dispatch: AppDispatch = useDispatch();
  const tagBackgroundColor = useSelector(getTagColor);
  const tagTextColor = useSelector(getTagTextColor);
  const tagGroupCollapsed: Array<string> = useSelector(getTagGroupCollapsed);
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);

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
    useState(false);
  const [isEditTagGroupDialogOpened, setIsEditTagGroupDialogOpened] =
    useState(false);
  const [isCreateTagDialogOpened, setIsCreateTagDialogOpened] = useState(false);
  const [isEditTagDialogOpened, setIsEditTagDialogOpened] = useState(false);

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  const currentWorkSpace = workSpacesContext?.getCurrentWorkSpace?.();

  useEffect(() => {
    if (currentWorkSpace) {
      const workspaceTagGroups = tagGroups.filter(
        (t) => t.workSpaceId === currentWorkSpace.uuid,
      );
      setWSpaceTagGroups(
        workspaceTagGroups.length ? workspaceTagGroups : tagGroups,
      );
    } else {
      setWSpaceTagGroups(tagGroups);
    }
  }, [currentWorkSpace, tagGroups]);

  const toggleTagGroupDispatch = useCallback(
    (uuid: string) => dispatch(SettingsActions.toggleTagGroup(uuid)),
    [dispatch],
  );

  const handleTagGroupMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, tagGroup: TS.TagGroup) => {
      setTagGroupMenuAnchorEl(event.currentTarget);
      setSelectedTagGroupEntry(tagGroup);
    },
    [],
  );

  const handleTagMenu = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      tag: TS.Tag,
      tagGroup: TS.TagGroup,
      haveSelectedEntries: boolean,
    ) => {
      const isSmartTag = tag.functionality && tag.functionality.length > 0;
      if (!isSmartTag || haveSelectedEntries) {
        setTagMenuAnchorEl(event.currentTarget);
        setSelectedTagGroupEntry(tagGroup);
        setSelectedTag(tag);
      }
    },
    [],
  );

  const handleTagLibraryMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setTagLibraryMenuAnchorEl(event.currentTarget);
    },
    [],
  );

  const showCreateTagGroupDialog = useCallback(() => {
    setIsCreateTagGroupDialogOpened(true);
  }, []);

  const showCreateTagsDialog = useCallback(() => {
    setIsCreateTagDialogOpened(true);
    setTagGroupMenuAnchorEl(null);
  }, []);

  const showEditTagGroupDialog = useCallback(() => {
    setIsEditTagGroupDialogOpened(true);
    setTagGroupMenuAnchorEl(null);
  }, []);

  const showDeleteTagGroupDialog = useCallback(() => {
    openConfirmDialog(
      t('core:deleteTagGroup'),
      t('core:deleteTagGroupContentConfirm', {
        tagGroup: selectedTagGroupEntry ? selectedTagGroupEntry.title : '',
      }),
      (result) => {
        if (result && selectedTagGroupEntry) {
          removeTagGroup(selectedTagGroupEntry.uuid);
        }
      },
      'cancelDeleteTagGroupDialog',
      'confirmDeleteTagGroupDialog',
    );
    setTagGroupMenuAnchorEl(null);
  }, [openConfirmDialog, removeTagGroup, selectedTagGroupEntry, t]);

  const renderTagGroup = useCallback(
    (tagGroup, index: number) => {
      if (!saveTagInLocation && tagGroup.locationId) return null;
      const expanded = !(
        tagGroupCollapsed && tagGroupCollapsed.includes(tagGroup.uuid)
      );
      return (
        <Box key={tagGroup.uuid}>
          <TagGroupTitleDnD
            index={index}
            tagGroup={tagGroup}
            moveTagGroup={moveTagGroup}
            handleTagGroupMenu={handleTagGroupMenu}
            toggleTagGroup={toggleTagGroupDispatch}
            tagGroupCollapsed={tagGroupCollapsed}
            isReadOnly={tagGroup.readOnly}
          />
          <CustomDragLayer />
          <Collapse in={expanded} unmountOnExit>
            <TagGroupContainer taggroup={tagGroup}>
              {tagGroup.children &&
                tagGroup.children.map((tag: TS.Tag, idx: number) => {
                  const isSmartTag =
                    tag.functionality && tag.functionality.length > 0;
                  return (
                    <TagContainerDnd
                      key={tagGroup.uuid + tag.title}
                      index={idx}
                      tag={tag}
                      tagGroup={tagGroup}
                      tagMode={isSmartTag ? 'display' : 'default'}
                      handleTagMenu={handleTagMenu}
                      moveTag={moveTag}
                      changeTagOrder={changeTagOrder}
                      selectedEntries={selectedEntries}
                    />
                  );
                })}
            </TagGroupContainer>
          </Collapse>
        </Box>
      );
    },
    [
      saveTagInLocation,
      tagGroupCollapsed,
      moveTagGroup,
      handleTagGroupMenu,
      toggleTagGroupDispatch,
      handleTagMenu,
      moveTag,
      changeTagOrder,
      selectedEntries,
    ],
  );

  const allTags = useMemo(() => getAllTags(wSpaceTagGroups), [wSpaceTagGroups]);

  return (
    <Box
      sx={{
        height: '100%',
        paddingLeft: '5px',
        paddingRight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SidePanelTitle
        title={t('core:tagLibrary')}
        tooltip={`Your tag library contains ${allTags.length} tags \ndistributed in ${wSpaceTagGroups.length} tag groups`}
        menuButton={
          (wSpaceTagGroups.some((tg) => !tg.readOnly) ||
            wSpaceTagGroups.length === 0) && (
            <TsIconButton
              data-tid="tagLibraryMenu"
              onClick={handleTagLibraryMenu}
            >
              <MoreMenuIcon />
            </TsIconButton>
          )
        }
      />
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
      />
      {Boolean(tagMenuAnchorEl) && (
        <TagMenu
          anchorEl={tagMenuAnchorEl}
          open={Boolean(tagMenuAnchorEl)}
          onClose={() => setTagMenuAnchorEl(null)}
          showEditTagDialog={() => setIsEditTagDialogOpened(true)}
          selectedTag={selectedTag}
          selectedTagGroupEntry={selectedTagGroupEntry}
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
      <Box
        sx={{
          paddingTop: 0,
          marginTop: 0,
          borderRadius: '5px',
          height: `calc(100% - ${reduceHeightBy}px)`,
          width: 310,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        data-tid="tagLibraryTagGroupList"
      >
        {AppConfig.showSmartTags && (
          <Box sx={{ paddingTop: 0, paddingBottom: 0 }}>
            {SmartTags(t).map(renderTagGroup)}
          </Box>
        )}
        <Box sx={{ paddingTop: 0 }}>{wSpaceTagGroups.map(renderTagGroup)}</Box>
      </Box>
    </Box>
  );
}

export default React.memo(TagLibrary);
