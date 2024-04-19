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

import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import { isFunc } from '@tagspaces/tagspaces-common/misc';
import TagGroupContainer from '../TagGroupContainer';
import TagContainer from '../TagContainer';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { exportTagGroups } from '-/services/taglibrary-utils';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

interface Props {
  open: boolean;
  tagGroups: Array<any>;
  onClose: () => void;
  dialogModeImport: boolean;
  showNotification?: (text: string) => void;
}

function ImportExportTagGroupsDialog(props: Props) {
  const { importTagGroups } = useTaggingActionsContext();
  const { t } = useTranslation();
  const selectedAll = useRef(true);
  const [tagGroupList, setTagGroupList] = useState<Array<any>>(
    props.tagGroups.map((entry) => ({
      ...entry,
      selected: selectedAll.current,
    })),
  );

  const handleToggleSelectAll = () => {
    selectedAll.current = !selectedAll.current;
    setTagGroupList(
      tagGroupList.map((entry) => ({
        ...entry,
        selected: selectedAll.current,
      })),
    );
  };

  const isSelected = () => tagGroupList.some((n) => n.selected === true);

  const handleTagGroup = (tagGroup: any, checked: boolean, index) => {
    setTagGroupList([
      ...tagGroupList.slice(0, index),
      {
        ...tagGroupList[index],
        selected: !checked,
      },
      ...tagGroupList.slice(index + 1),
    ]);
  };

  const onConfirm = () => {
    const { showNotification } = props;
    const groupList = tagGroupList.filter((tagGroup) => tagGroup.selected);
    props.onClose();
    if (props.dialogModeImport) {
      importTagGroups(groupList);
      if (isFunc(showNotification)) {
        showNotification(t('core:successfullyImportedGroupTags'));
      }
    } else {
      exportTagGroups(groupList);
      if (isFunc(showNotification)) {
        showNotification(t('core:successfullyExportedGroupTags'));
      }
    }
  };

  const renderTagGroups = (tagGroup, index) => (
    <div key={tagGroup.uuid || tagGroup.key}>
      <FormControl component="fieldset">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                id={tagGroup.uuid || tagGroup.key}
                checked={tagGroup.selected}
                onClick={(e) => handleTagGroup(e, tagGroup.selected, index)}
                // onChange={e => handleChange(e)}
                value={tagGroup.title}
                name={tagGroup.title}
              />
            }
            label={tagGroup.title}
          />
        </FormGroup>
      </FormControl>
      <TagGroupContainer taggroup={tagGroup}>
        {tagGroup.children &&
          tagGroup.children.map((tag: TS.Tag) => (
            <TagContainer tag={tag} tagMode="display" />
          ))}
      </TagGroupContainer>
    </div>
  );

  const { onClose, open } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
    >
      <DialogTitle>
        {props.dialogModeImport
          ? t('core:importGroupTagsTitle')
          : t('core:exportGroupTagsTitle')}
        <DialogCloseButton testId="closeIETagGroupsTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <Button color="primary" onClick={handleToggleSelectAll}>
          {t('core:selectAllTagGroups')}
        </Button>
        <FormControl fullWidth={true}>
          {tagGroupList.map(renderTagGroups)}
        </FormControl>
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button onClick={props.onClose}>{t('core:cancel')}</Button>
        <Button
          disabled={!isSelected()}
          onClick={onConfirm}
          data-tid="confirmImportExport"
          color="primary"
          variant="contained"
        >
          {props.dialogModeImport ? 'Import' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportExportTagGroupsDialog;
