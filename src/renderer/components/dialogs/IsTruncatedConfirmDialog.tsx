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
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DraggablePaper from '-/components/DraggablePaper';
import Dialog from '@mui/material/Dialog';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import MaxLoopsSelect from '-/components/dialogs/MaxLoopsSelect';
import AppConfig from '-/AppConfig';
import Typography from '@mui/material/Typography';
import InfoIcon from '-/components/InfoIcon';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

function IsTruncatedConfirmDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const { openDirectory, currentDirectoryPath } = useDirectoryContentContext();
  const { currentLocation, editLocation } = useCurrentLocationContext();

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
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
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
      <DialogActions>
        <Button onClick={() => onClose()} color="primary">
          {t('core:continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IsTruncatedConfirmDialog;
