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
import DraggablePaper from '-/components/DraggablePaper';
import InfoIcon from '-/components/InfoIcon';
import TsButton from '-/components/TsButton';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import MaxLoopsSelect from '-/components/dialogs/MaxLoopsSelect';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
}

function IsTruncatedConfirmDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const { openDirectory, currentDirectoryPath } = useDirectoryContentContext();
  const { findLocation, editLocation } = useCurrentLocationContext();
  const currentLocation = findLocation();

  let defaultMaxLoops = AppConfig.maxLoops;
  if (
    currentLocation &&
    currentLocation.maxLoops &&
    currentLocation.maxLoops > 0
  ) {
    const maxLoopsAsString = currentLocation.maxLoops + '';
    defaultMaxLoops = parseInt(maxLoopsAsString, 10);
  }
  //const [maxLoops, setMaxLoops] = useState<number>(defaultMaxLoops);

  function changeMaxLoops(event: React.ChangeEvent<HTMLInputElement>) {
    const loops = event.target.value;
    if (loops) {
      editLocation(
        {
          ...currentLocation,
          maxLoops: parseInt(loops, 10),
        },
        false,
      );
      onClose();
      if (currentLocation.type === locationType.TYPE_CLOUD) {
        openDirectory(currentDirectoryPath);
      }
    }
  }

  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
    >
      <DialogTitle sx={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:warningDirectoryIsTruncated')}
        <DialogCloseButton testId="closeIsTruncatedTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="span">
          <FormControlLabel
            labelPlacement="start"
            style={{ justifyContent: 'space-between' }}
            control={
              <MaxLoopsSelect
                maxLoops={defaultMaxLoops}
                changeMaxLoops={changeMaxLoops}
              />
            }
            label={
              <Typography>
                {t('core:maxLoops')}
                <InfoIcon tooltip={t('core:maxLoopsHelp')} />
              </Typography>
            }
          />
        </DialogContentText>
      </DialogContent>
      <TsDialogActions>
        <TsButton onClick={() => onClose()}>{t('core:continue')}</TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default IsTruncatedConfirmDialog;
