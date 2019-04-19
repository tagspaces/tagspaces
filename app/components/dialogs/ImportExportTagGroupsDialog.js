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
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import TagGroupContainer from '../TagGroupContainer';
import TagContainer from '../TagContainer';
import i18n from '../../services/i18n';
import { isFunc } from '../../utils/misc';
import AppConfig from '../../config';

const styles = {
  root: {
    width: 400,
    height: '100%',
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
    marginBottom: 30
  },
};

type Props = {
  open: boolean,
  onClose: () => void,
  dialogModeImport: boolean,
  showNotification?: (text: string, notificationType: string, autohide: boolean) => void
};

type State = {
  errorTextName?: boolean,
  disableConfirmButton?: boolean,
  open?: boolean,
  tagGroupList?: null | Array,
  checkedAll?: boolean
};

class ImportExportTagGroupsDialog extends React.Component<Props, State> {
  state = {
    errorTextName: false,
    disableConfirmButton: true,
    open: false,
    selectedAll: false,
    tagGroupList: []
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (nextProps.open === true) {
      const tagGroupList = [];
      const tagGroups = nextProps.tagGroups;
      tagGroups.map(entry => {
        tagGroupList.push({
          uuid: entry.uuid || entry.key,
          title: entry.title,
          color: entry.color,
          textcolor: entry.textcolor,
          children: entry.children,
          expanded: entry.expanded,
          selected: true
        });
      });
      this.setState({ tagGroupList, selectedAll: true }, this.handleValidation);
    }
  };

  handleToggleSelectAll = () => {
    const tagGroupList = [];
    const tagGroups = this.state.tagGroupList;
    tagGroups.map(entry => {
      tagGroupList.push({
        uuid: entry.uuid || entry.key,
        title: entry.title,
        color: entry.color,
        textcolor: entry.textcolor,
        children: entry.children,
        expanded: entry.expanded,
        selected: !this.state.selectedAll
      });
    });
    this.setState({ tagGroupList, selectedAll: !this.state.selectedAll }, this.handleValidation);
  };

  handleChange = name => (event: Object, checked: boolean) => {
    this.setState({ [name]: !checked });
  };

  handleValidation() {
    let selected = false;
    this.state.tagGroupList.map(n => {
      if (n.selected === true) {
        selected = true;
      }
    });
    if (selected) {
      this.setState({ disableConfirmButton: false });
    } else {
      this.setState({ disableConfirmButton: true });
    }
  }

  handleTagGroup = (tagGroup: Object, checked: boolean, index) => {
    const groups = this.state.tagGroupList;
    if (!checked) {
      groups[index].selected = true;
      this.setState({ tagGroupList: groups }, this.handleValidation);
    } else {
      groups[index].selected = false;
      this.setState({ tagGroupList: groups }, this.handleValidation);
    }
  };

  onConfirm = () => {
    const { showNotification } = this.props;
    const groupList = [];
    const selectedTagGroup = this.state.tagGroupList;
    selectedTagGroup.map((tagGroup, i) => {
      if (tagGroup.selected) {
        groupList.push({
          uuid: tagGroup.uuid || tagGroup.key,
          title: tagGroup.title,
          color: tagGroup.color,
          textcolor: tagGroup.textcolor,
          children: tagGroup.children,
          expanded: tagGroup.expanded
        });
      }
    });
    this.props.onClose();
    if (this.props.dialogModeImport) {
      this.props.importTagGroups(groupList);
      if (isFunc(showNotification)) {
        showNotification(i18n.t('core:successfullyImportedGroupTags'));
      }
    } else {
      this.props.exportTagGroups(groupList);
      if (isFunc(showNotification)) {
        showNotification(i18n.t('core:successfullyExportedGroupTags'));
      }
    }
  };

  renderTagGroups = (tagGroup, index) => {
    return (
      <div key={tagGroup.uuid || tagGroup.key}>
        <FormControl component="fieldset">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  id={tagGroup.uuid || tagGroup.key}
                  checked={tagGroup.selected}
                  onClick={e => this.handleTagGroup(e, tagGroup.selected, index)}
                  onChange={e => this.handleChange(e)}
                  value={tagGroup.title}
                  name={tagGroup.title}
                />
              }
              label={tagGroup.title}
            />
          </FormGroup>
        </FormControl>
        <TagGroupContainer taggroup={tagGroup}>
          {tagGroup.children && tagGroup.children.map(tag => (
            <TagContainer
              tag={tag}
              tagMode="display"
            />
          ))}
        </TagGroupContainer>
      </div>
    );
  };

  renderTitle = () => {
    if (this.props.dialogModeImport) {
      return (<DialogTitle>{i18n.t('core:importGroupTagsTitle')}</DialogTitle>);
    }
    return (<DialogTitle>{i18n.t('core:exportGroupTagsTitle')}</DialogTitle>);
  };

  renderContent = () => {
    return (
      <DialogContent className={this.props.classes.root}>
        <Button
          color="primary"
          onClick={this.handleToggleSelectAll}
        >
          {i18n.t('core:selectAllTagGroups')}
        </Button>
        <FormControl fullWidth={true}>
          {this.state.tagGroupList.map(this.renderTagGroups)}
        </FormControl>
      </DialogContent>
    );
  };

  renderActions = () => (
    <DialogActions>
      <Button
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        disabled={this.state.disableConfirmButton}
        onClick={this.onConfirm}
        data-tid="confirmImportExport"
        color="primary"
      >
        { this.props.dialogModeImport ? 'Import' : 'Export' }
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withStyles(styles)(ImportExportTagGroupsDialog);
