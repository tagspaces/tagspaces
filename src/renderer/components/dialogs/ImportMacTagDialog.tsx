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
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import { useProgressDialogContext } from '-/components/dialogs/hooks/useProgressDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { readMacOSTags } from '-/services/utils-io';
import { Switch } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  directoryPath: string;
}

function ImportMacTagDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose, directoryPath } = props;

  const { openProgressDialog, closeProgressDialog } =
    useProgressDialogContext();
  const { showNotification } = useNotificationContext();
  const { currentLocation } = useCurrentLocationContext();
  const { addTags } = useTaggingActionsContext();
  const recursive = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const toggleRecursive = (event: React.ChangeEvent<HTMLInputElement>) => {
    recursive.current = event.target.checked;
    forceUpdate();
  };

  function importMacTags() {
    if (Pro && Pro.MacTagsImport && Pro.MacTagsImport.importTags) {
      onClose();
      /*if (
        !confirm(`Experimental feature\n
Depending on how many tags you have in your current directory, the tag extraction process may take a long time in which the application's user interface may appear as blocked.\n
Do you want to continue?`)
      ) {
        return false;
      }*/
      openProgressDialog('importingMacTags');

      const entryCallback = (entry) => {
        readMacOSTags(entry.path)
          .then((tags) => {
            if (tags.length > 0) {
              addTags([entry], tags);
            }
            return tags;
          })
          .catch((err) => {
            console.log('Error creating tags: ' + err);
          });
      };
      Pro.MacTagsImport.importTags(
        directoryPath,
        currentLocation.listDirectoryPromise,
        entryCallback,
        recursive.current,
      )
        .then(() => {
          closeProgressDialog();
          console.log('Import tags succeeded ' + directoryPath);
          showNotification(
            'Tags from ' + directoryPath + ' are imported successfully.',
            'default',
            true,
          );
          return true;
        })
        .catch((err) => {
          console.log('Error importing tags: ' + directoryPath, err);
          closeProgressDialog();
        });
    } else {
      showNotification(
        t('core:thisFunctionalityIsAvailableInPro'),
        'default',
        true,
      );
      return true;
    }
  }

  return (
    <Dialog
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      open={open}
      onClose={onClose}
      style={{ minHeight: 200 }}
    >
      <DialogTitle
        sx={{ cursor: 'move', minHeight: '20px' }}
        data-tid="ImportMacTagDialogTitle"
        id="draggable-dialog-title"
      >
        {t('core:importMacTags')}
        <DialogCloseButton testId="closeImportMacTagTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <div style={{ margin: 20 }}>{t('core:importMacTagsHelp')}</div>
        <FormControlLabel
          labelPlacement="start"
          control={
            <Switch
              data-tid="importTagsRecursiveTID"
              checked={recursive.current}
              onChange={toggleRecursive}
              size="small"
              name="importTagsRecursive"
            />
          }
          label={t('core:importTagsRecursive')}
        />
      </DialogContent>
      <TsDialogActions style={{ justifyContent: 'space-between' }}>
        <TsButton
          data-tid="cancelImportTagsTID"
          onClick={() => {
            onClose();
          }}
        >
          {t('core:cancel')}
        </TsButton>
        <TsButton
          data-tid="createTID"
          variant="contained"
          onClick={() => {
            importMacTags();
          }}
        >
          {t('core:ok')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default ImportMacTagDialog;
