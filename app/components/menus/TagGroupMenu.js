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
import Edit from '@material-ui/icons/Edit';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteTagGroupIcon from '@material-ui/icons/DeleteForever';
import SortTagGroupIcon from '@material-ui/icons/SortByAlpha';
import TagIcon from '@material-ui/icons/LocalOffer';
import CollectTagsIcon from '@material-ui/icons/Voicemail';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { type TagGroup } from '../../reducers/taglibrary';
import i18n from '../../services/i18n';
import { Pro } from '../../pro';

type Props = {
  anchorEl: Object,
  open: boolean,
  onClose: () => void,
  selectedTagGroupEntry: TagGroup,
  showCreateTagsDialog: () => void,
  showDeleteTagGroupDialog: () => void,
  showEditTagGroupDialog: () => void,
  moveTagGroupUp: (tagGroupId: string) => void,
  moveTagGroupDown: (tagGroupId: string) => void,
  sortTagGroup: (tagGroupId: string) => void,
  collectTagsFromLocation: (tagGroup: TagGroup) => void,
  handleCloseTagGroupMenu: () => void
};

class TagLibraryMenu extends React.Component<Props> {
  handleCollectTags = () => {
    this.props.onClose();

    if (this.props.selectedTagGroupEntry) {
      this.props.collectTagsFromLocation(this.props.selectedTagGroupEntry);
    }
    this.props.handleCloseTagGroupMenu();
  };

  moveTagGroupUp = () => {
    if (this.props.selectedTagGroupEntry) {
      this.props.moveTagGroupUp(this.props.selectedTagGroupEntry.uuid);
    }
    this.props.handleCloseTagGroupMenu();
  };

  moveTagGroupDown = () => {
    if (this.props.selectedTagGroupEntry) {
      this.props.moveTagGroupDown(this.props.selectedTagGroupEntry.uuid);
    }
    this.props.handleCloseTagGroupMenu();
  };

  sortTagGroup = () => {
    if (this.props.selectedTagGroupEntry) {
      this.props.sortTagGroup(this.props.selectedTagGroupEntry.uuid);
    }
    this.props.handleCloseTagGroupMenu();
  };

  render = () => (
    <div style={{ overflowY: 'hidden !important' }}>
      <Menu
        anchorEl={this.props.anchorEl}
        open={this.props.open}
        onClose={this.props.handleCloseTagGroupMenu}
      >
        <MenuItem data-tid="createTags" onClick={this.props.showCreateTagsDialog}>
          <ListItemIcon>
            <TagIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:addTags')} />
        </MenuItem>
        <MenuItem
          data-tid="editTagGroup"
          onClick={this.props.showEditTagGroupDialog}
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
            <SortTagGroupIcon />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:sortTagGroup')} />
        </MenuItem>
        <MenuItem
          data-tid="deleteTagGroup"
          onClick={this.props.showDeleteTagGroupDialog}
        >
          <ListItemIcon>
            <DeleteTagGroupIcon />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:deleteTagGroup')} />
        </MenuItem>
        <MenuItem
          data-tid="collectTags"
          onClick={this.handleCollectTags}
          title={Pro ? '' : i18n.t('core:needProVersion')}
        >
          <ListItemIcon>
            <CollectTagsIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:collectTagsFromLocation') + (Pro ? '' : ' PRO')} />
        </MenuItem>
      </Menu>
    </div>
  );
}

export default TagLibraryMenu;
