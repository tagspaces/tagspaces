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
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import { SettingsTab } from '-/components/dialogs/SettingsDialog';
import TemplatesDropDown from '-/components/dialogs/components/TemplatesDropDown';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { Pro } from '-/pro';
import { fileNameValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useFirstRender from '-/utils/useFirstRender';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  FormControl,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
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
  fileContent: string;
  handleFileNameChange: (fileName: string) => void;
  handleFileContentChange: (fileContent: string) => void;
  createFile: (fileType: TS.FileType, template?: TS.FileTemplate) => void;
  haveError: (error: boolean) => void;
  tidPrefix?: string;
  fileType?: TS.FileType;
  onClose: (event?: Object, reason?: string) => void;
}

function CreateFile(props: Props) {
  const {
    tidPrefix,
    fileType,
    createFile,
    fileName,
    fileContent,
    handleFileNameChange,
    handleFileContentChange,
    haveError,
    onClose,
  } = props;
  const { t } = useTranslation();
  const { targetDirectoryPath } = useTargetPathContext();
  const { openSettingsDialog } = useSettingsDialogContext();
  const [inputError, setInputError] = useState<boolean>(false);
  const fileContentRef = useRef<HTMLInputElement | null>(null);
  const fileNameRef = useRef<HTMLInputElement | null>(null);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const noSuitableLocation = !targetDirectoryPath;

  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const templatesArray = fileTemplatesContext?.getTemplates();

  useEffect(() => {
    if (!firstRender && fileNameRef.current && fileContentRef.current) {
      fileNameRef.current.value = fileName;
      fileContentRef.current.value = fileContent;
    }
  }, [fileName, fileContent]);

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
      const indexOfBracket = fileName.indexOf(AppConfig.beginTagContainer);
      let endRange = fileName.length;
      if (indexOfBracket > 0) {
        endRange = indexOfBracket;
      }
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

  return (
    <Grid container spacing={1}>
      {fileType ? (
        <>
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
          <FormControl fullWidth={true}>
            <TsTextField
              // autoFocus
              id="fileContentID"
              label={t('core:fileContent')}
              multiline
              rows={5}
              inputRef={fileContentRef}
              defaultValue={fileContent}
              onChange={handleContentChange}
            />
          </FormControl>
          <TemplatesDropDown fileType={fileType} label={t('templatesTab')} />
        </>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <TsButton
            size="small"
            variant="text"
            onClick={() => {
              onClose();
              openSettingsDialog(SettingsTab.Templates);
            }}
            disabled={!Pro}
          >
            {t('manageTemplates')}
          </TsButton>
          <Grid container spacing={2}>
            {templatesArray?.map((template: TS.FileTemplate, index) => (
              <Grid key={index} size={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        alignItems: 'anchor-center',
                      }}
                    >
                      <Typography variant="h6">{template.name}</Typography>
                      <span
                        style={{
                          marginLeft: 5,
                          padding: 2,
                          fontSize: 12,
                          textTransform: 'uppercase',
                          border: '1px solid gray',
                          borderRadius: '3px',
                          height: 13,
                        }}
                      >
                        {template.type}
                      </span>
                    </Box>
                    <Typography
                      variant="body2"
                      title={template.content}
                      sx={{
                        maxHeight: '75px',
                        height: '75px',
                        overflowY: 'auto',
                      }}
                    >
                      {template.description || template.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <TsButton
                      size="small"
                      sx={{
                        marginLeft: '10px',
                        marginBottom: '10px',
                        marginTop: '-10px',
                      }}
                      onClick={() => createFile(template.type, template)}
                      data-tid={
                        'create' +
                        (template.type === 'md' ? 'Markdown' : template.type) +
                        'Button'
                      }
                      disabled={noSuitableLocation}
                    >
                      {t('useTemplate')}
                    </TsButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Grid>
  );
}

export default CreateFile;
