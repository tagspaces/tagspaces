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

import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { Pro } from '-/pro';
import { fileNameValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import versionMeta from '-/version.json';
import { ButtonGroup, FormControl } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  fileName: string;
  handleFileNameChange: (fileName: string) => void;
  handleFileContentChange: (fileContent: string) => void;
  createFile: (fileType: TS.FileType) => void;
  haveError: (error: boolean) => void;
  tidPrefix?: string;
  fileType?: TS.FileType;
}

function CreateFile(props: Props) {
  const {
    tidPrefix,
    fileType,
    createFile,
    fileName,
    handleFileNameChange,
    handleFileContentChange,
    haveError,
  } = props;
  const { t } = useTranslation();
  const { targetDirectoryPath } = useTargetPathContext();
  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const fileTemplate = fileTemplatesContext?.getTemplate(fileType);

  const [inputError, setInputError] = useState<boolean>(false);
  const fileContentRef = useRef<HTMLInputElement | null>(null);
  const fileNameRef = useRef<HTMLInputElement | null>(null);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const noSuitableLocation = !targetDirectoryPath;

  useEffect(() => {
    if (fileTemplate) {
      if (fileContentRef.current) {
        fileContentRef.current.value = getFileContent();
        if (fileTemplate.fileNameTmpl) {
          fileNameRef.current.value = fileTemplate.fileNameTmpl.replace(
            '{timestamp}',
            formatDateTime4Tag(new Date(), true),
          );
        } else {
          fileNameRef.current.value = '';
        }
      }
    }
  }, [fileTemplate]);

  useEffect(() => {
    haveError(inputError);
  }, [inputError]);

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
      /*const indexOfBracket = fileName.current.indexOf(
        AppConfig.beginTagContainer
      );*/
      let endRange = fileName.length;
      // if (indexOfBracket > 0) {
      //   endRange = indexOfBracket;
      // }
      target.setSelectionRange(0, endRange);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileNameChange(event.target.value);
    handleValidation(event.target.value);
  };
  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileContentChange(event.target.value);
  };

  const handleValidation = (file) => {
    let noValid = fileNameValidation(file);

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

  function getFileContent() {
    if (fileType !== 'url' && fileTemplate && fileTemplate.content) {
      const creationDate = new Date().toISOString();
      const dateTimeArray = creationDate.split('T');
      return (
        (fileType === 'html' ? '\n<br />\n' : ' \n\n') +
        fileTemplate.content
          .replace(
            '{createdInApp}',
            `${t('core:createdIn')} ${versionMeta.name}`,
          )
          .replace('{date}', dateTimeArray[0])
          .replace('{time}', dateTimeArray[1].split('.')[0])
      );
    }
    return '';
  }

  return (
    <Grid container spacing={1}>
      <FormControl fullWidth={true} error={inputError}>
        <TsTextField
          inputRef={fileNameRef}
          error={inputError}
          name="entryName"
          label={t('core:fileName')}
          onChange={handleInputChange}
          onFocus={onInputFocus}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.code === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              createFile(fileType);
            }
          }}
          defaultValue={fileName}
          disabled={noSuitableLocation}
          autoFocus
          data-tid={tid('newEntryDialogInputTID')}
        />
        {inputError && (
          <FormHelperText>{t('core:fileNameHelp')}</FormHelperText>
        )}
      </FormControl>
      {fileType ? (
        <FormControl fullWidth={true}>
          <TsTextField
            autoFocus
            id="fileContentID"
            label={t('core:fileContent')}
            multiline
            rows={5}
            inputRef={fileContentRef}
            defaultValue={getFileContent()}
            onChange={handleContentChange}
          />
        </FormControl>
      ) : (
        <ButtonGroup style={{ margin: '0 auto' }}>
          <TsButton
            tooltip={t('createMarkdownTitle')}
            onClick={() => createFile('md')}
            data-tid={tid('createMarkdownButton')}
            disabled={noSuitableLocation}
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: 'bold',
            }}
          >
            {t('createMarkdown')}
          </TsButton>
          <TsButton
            tooltip={t('createNoteTitle')}
            onClick={() => createFile('html')}
            data-tid={tid('createRichTextFileButton')}
            disabled={noSuitableLocation}
            style={{
              borderRadius: 0,
            }}
          >
            {t('createRichTextFile')}
          </TsButton>
          <TsButton
            tooltip={t('createTextFileTitle')}
            onClick={() => createFile('txt')}
            data-tid={tid('createTextFileButton')}
            disabled={noSuitableLocation}
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          >
            {t('createTextFile')}
          </TsButton>
        </ButtonGroup>
      )}
    </Grid>
  );
}

export default CreateFile;
