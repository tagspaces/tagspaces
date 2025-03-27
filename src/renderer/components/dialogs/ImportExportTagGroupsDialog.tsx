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

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { exportTagGroups } from '-/services/taglibrary-utils';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { isFunc } from '@tagspaces/tagspaces-common/misc';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TagContainer from '../TagContainer';
import TagGroupContainer from '../TagGroupContainer';

interface Props {
  open: boolean;
  tagGroups: Array<any>;
  onClose: () => void;
  dialogModeImport: boolean;
  showNotification?: (text: string) => void;
}

function ImportExportTagGroupsDialog(props: Props) {
  const { importTagGroups } = useTaggingActionsContext();
  const { findLocation } = useCurrentLocationContext();
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

  function getLocationName(locationId: string) {
    if (locationId) {
      const location: CommonLocation = findLocation(locationId);
      if (location) {
        return ' (' + location.name + ')';
      }
    }
    return '';
  }

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
                value={tagGroup.title}
                name={tagGroup.title}
              />
            }
            label={tagGroup.title + getLocationName(tagGroup.locationId)}
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
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const confirmButton = (
    <TsButton
      disabled={!isSelected()}
      onClick={onConfirm}
      data-tid="confirmImportExport"
      variant="contained"
    >
      {props.dialogModeImport ? 'Import' : 'Export'}
    </TsButton>
  );
  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      onClose={onClose}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
    >
      <TsDialogTitle
        dialogTitle={
          props.dialogModeImport
            ? t('core:importGroupTagsTitle')
            : t('core:exportGroupTagsTitle')
        }
        closeButtonTestId="closeIETagGroupsTID"
        onClose={onClose}
        actionSlot={confirmButton}
      />
      <DialogContent>
        <TsButton onClick={handleToggleSelectAll}>
          {t('core:selectAllTagGroups')}
        </TsButton>
        <FormControl fullWidth={true}>
          {tagGroupList.map(renderTagGroups)}
        </FormControl>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton onClick={props.onClose}>{t('core:cancel')}</TsButton>
          {confirmButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default ImportExportTagGroupsDialog;
