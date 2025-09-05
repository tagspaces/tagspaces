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
import TsButton from '-/components/TsButton';
import CreateFile from '-/components/dialogs/components/CreateFile';
import CreateLink from '-/components/dialogs/components/CreateLink';
import TargetPath from '-/components/dialogs/components/TargetPath';
import TemplatesDropDown from '-/components/dialogs/components/TemplatesDropDown';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  formatDateTime4Tag,
  locationType,
} from '@tagspaces/tagspaces-common/misc';
import { useContext, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: (event?: Object, reason?: string) => void;
  fileType?: TS.FileType;
  fileName?: string;
}

function NewFileDialog(props: Props) {
  const { open, onClose, fileType } = props;
  const { t } = useTranslation();
  const { createFileAdvanced } = useOpenedEntryContext();
  const { findLocation, openLocation, getFirstRWLocation } =
    useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { targetDirectoryPath } = useTargetPathContext();
  const haveError = useRef<boolean>(false);
  const urlInputError = useRef<string>(undefined);
  const firstRWLocation = getFirstRWLocation();
  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const fileTemplate = fileTemplatesContext?.getTemplate(fileType);
  const fileName = useRef<string>(initialFileName());

  function initialFileName() {
    if (props.fileName) {
      return (
        props.fileName +
        AppConfig.beginTagContainer +
        formatDateTime4Tag(new Date(), true) +
        AppConfig.endTagContainer
      );
    }
    if (fileTemplate && fileTemplate.fileNamePrefix !== undefined) {
      return fileTemplate.fileNamePrefix.replace(
        '{dateTag}',
        formatDateTime4Tag(new Date(), true),
      );
    }
    return (
      (fileType === 'url' ? 'link' : 'note') +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer
    );
  }

  const fileContent = useRef<string>('');

  function getFileType() {
    if (fileType === 'txt') {
      return t('createTXTFile');
    }
    if (fileType === 'md') {
      return t('createMarkdown');
    }
    if (fileType === 'html') {
      return t('createRichTextFile');
    }
    if (fileType === 'url') {
      return t('createLinkFile');
    }
    return t('newFileNote');
  }

  function loadLocation() {
    const currentLocation = findLocation();
    const isCloudLocation =
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD;
    // no currentDirectoryPath in root cloud location
    if (!isCloudLocation && !currentDirectoryPath && firstRWLocation) {
      openLocation(firstRWLocation);
    }
  }

  function createFile(fileType, targetPath) {
    if (targetPath) {
      if (fileType === 'url' && !fileContent.current) {
        haveError.current = true;
        urlInputError.current = t('core:emptyLink');
        forceUpdate();
      } else {
        loadLocation();
        createFileAdvanced(
          targetPath,
          fileName.current,
          fileContent.current,
          fileType,
        );
        onClose();
      }
    }
  }

  const okButton = (
    <TsButton
      data-tid="createTID"
      variant="contained"
      onClick={() => {
        createFile(fileType, targetDirectoryPath);
      }}
      disabled={haveError.current}
      style={{
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
      }}
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      aria-labelledby="draggable-dialog-title"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={getFileType()}
        onClose={onClose}
        closeButtonTestId="closeNewFileDialogTID"
        actionSlot={okButton}
      ></TsDialogTitle>
      <DialogContent
        style={{
          paddingTop: 10,
          minWidth: 200,
          // minHeight: 200,
          overflow: 'overlay',
        }}
        data-tid="newFileDialog"
      >
        {fileType === 'url' ? (
          <CreateLink
            createFile={(type) => createFile(type, targetDirectoryPath)}
            handleFileNameChange={(name) => (fileName.current = name)}
            handleFileContentChange={(content) =>
              (fileContent.current = content)
            }
            haveError={(error) => {
              haveError.current = error;
              urlInputError.current = '';
              forceUpdate();
            }}
            urlInputError={urlInputError.current}
            fileName={fileName.current}
          />
        ) : (
          <CreateFile
            fileType={fileType}
            createFile={(type) => createFile(type, targetDirectoryPath)}
            handleFileNameChange={(name) => (fileName.current = name)}
            handleFileContentChange={(content) =>
              (fileContent.current = content)
            }
            haveError={(error) => {
              haveError.current = error;
              forceUpdate();
            }}
            fileName={fileName.current}
          />
        )}
        <TemplatesDropDown fileType={fileType} label={t('templatesTab')} />
        <TargetPath />
      </DialogContent>
      {!smallScreen && fileType && (
        <TsDialogActions>
          <TsButton
            data-tid="backTID"
            onClick={() => {
              onClose();
            }}
          >
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default NewFileDialog;
