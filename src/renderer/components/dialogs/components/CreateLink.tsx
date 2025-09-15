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

import TsTextField from '-/components/TsTextField';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { fileNameValidation, urlValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { FormControl } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import React, { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  fileName: string;
  handleFileNameChange: (fileName: string) => void;
  handleFileContentChange: (fileContent: string) => void;
  createFile: (fileType: TS.FileType) => void;
  haveError: (error: boolean) => void;
  urlInputError?: string;
  tidPrefix?: string;
}

function CreateLink(props: Props) {
  const {
    tidPrefix,
    createFile,
    fileName,
    handleFileNameChange,
    handleFileContentChange,
    haveError,
    urlInputError,
  } = props;
  const { t } = useTranslation();
  const { targetDirectoryPath } = useTargetPathContext();

  const [inputError, setInputError] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const noSuitableLocation = !targetDirectoryPath;

  useEffect(() => {
    haveError(inputError || urlError);
  }, [inputError, urlError]);

  function tid(tid) {
    if (tidPrefix) {
      return tidPrefix + tid;
    }
    return tid;
  }

  const onInputFocus = (event) => {
    if (fileName) {
      event.preventDefault();
      const { target } = event;
      target.focus();
      let endRange = fileName.length;
      target.setSelectionRange(0, endRange);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileNameChange(event.target.value);
    handleValidation(fileNameValidation(event.target.value));
  };
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileContentChange(event.target.value);
    handleUrlValidation(!urlValidation(event.target.value));
  };

  const handleValidation = (noValid) => {
    if (noValid) {
      if (inputError !== noValid) {
        setInputError(noValid);
      } else {
        forceUpdate();
      }
    } else {
      setInputError(noValid);
    }
  };

  const handleUrlValidation = (noValid) => {
    if (noValid) {
      if (urlError !== noValid) {
        setUrlError(noValid);
      } else {
        forceUpdate();
      }
    } else {
      setUrlError(noValid);
    }
  };

  return (
    <Grid container spacing={1}>
      <FormControl fullWidth={true} error={inputError}>
        <TsTextField
          error={inputError}
          name="entryName"
          label={t('core:fileName')}
          onChange={handleInputChange}
          onFocus={onInputFocus}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.code === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              createFile('url');
            }
          }}
          defaultValue={fileName}
          disabled={noSuitableLocation}
          data-tid={tid('newEntryDialogInputTID')}
        />
        {inputError && (
          <FormHelperText>{t('core:fileNameHelp')}</FormHelperText>
        )}
      </FormControl>
      <FormControl fullWidth={true} error={urlError || !!urlInputError}>
        <TsTextField
          autoFocus
          error={urlError || !!urlInputError}
          id="fileLinkID"
          placeholder="e.g. https://wikipedia.org"
          label={t('core:linkURL')}
          onChange={handleUrlChange}
        />
        {urlError && (
          <FormHelperText>{t('core:urlValidationHelp')}</FormHelperText>
        )}
        {urlInputError && <FormHelperText>{urlInputError}</FormHelperText>}
      </FormControl>
    </Grid>
  );
}

export default CreateLink;
