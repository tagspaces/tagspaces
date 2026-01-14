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
import {
  CreateFileIcon,
  ReloadIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import { useExtensionsContext } from '-/hooks/useExtensionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getSupportedFileTypes,
  isDevMode,
} from '-/reducers/settings';
import defaultSettings from '-/reducers/settings-default';
import { dataTidFormat } from '-/services/test';
import { getUserDataDir } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useFirstRender from '-/utils/useFirstRender';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

function SettingsFileTypes() {
  const { t } = useTranslation();
  const { extensions } = useExtensionsContext();
  const { openConfirmDialog } = useNotificationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const items = useRef<Array<TS.FileTypes>>([...supportedFileTypes]);
  const selectedItem = useRef<TS.FileTypes>(undefined);
  const isValidationInProgress = useRef<boolean>(false);
  const [isColorPickerVisible, setColorPickerVisible] =
    useState<boolean>(false);
  const [rows, setRows] = useState<Array<TS.FileTypes>>([
    ...supportedFileTypes,
  ]);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  //const extensions = useSelector(getExtensions);
  const devMode = useSelector(isDevMode);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!firstRender) {
      items.current = [...supportedFileTypes];
      setRows([...supportedFileTypes]);
      isValidationInProgress.current = false;
    }
  }, [supportedFileTypes, firstRender]);

  const updateItems = (
    fileType: TS.FileTypes,
    targetKey,
    targetValue,
    disableSave = false,
  ) => {
    let identifierKey;
    let identifierValue;
    if (fileType.id) {
      identifierKey = 'id';
      identifierValue = fileType.id;
    } else {
      identifierKey = 'type';
      identifierValue = fileType.type;
    }
    let isSaveable = false;
    let hasViewer = false;
    const modifiedItems = items.current.map((item) => {
      if (item[identifierKey] === identifierValue) {
        isSaveable =
          item.type !== '' || (targetKey === 'type' && targetValue !== '');
        hasViewer = item.viewer !== '';
        const itemUpdated = {
          ...item,
          [targetKey]: targetValue,
        };
        selectedItem.current = itemUpdated;
        return itemUpdated;
      }
      return item;
    });
    items.current = modifiedItems;
    setRows([...modifiedItems]);
    if (
      (targetKey !== 'type' && isSaveable && !disableSave) ||
      (targetKey === 'type' && hasViewer && isSaveable && !disableSave)
    ) {
      saveFileTypes(modifiedItems);
    } else {
      isValidationInProgress.current = true;
    }
  };

  const saveFileTypes = (newItems) => {
    isValidationInProgress.current = true;

    const isValid = validateSelectedFileTypes(newItems);

    if (!isValid) {
      setRows([...newItems]);
      return false;
    }
    dispatch(SettingsActions.setSupportedFileTypes(newItems));
  };

  const validateSelectedFileTypes = (newItems) => {
    let isValid = true;

    newItems.map((item) => {
      const hasDuplicates =
        items.current.filter((targetItem) => targetItem.type === item.type)
          .length > 1;

      if (
        isValid &&
        (item.type === '' || item.viewer === '' || hasDuplicates)
      ) {
        isValid = false;
      }
      return item;
    });

    return isValid;
  };

  const openColorPicker = (selected) => {
    setColorPickerVisible(true);
    selectedItem.current = selected;
  };

  const closeColorPicker = () => {
    setColorPickerVisible(false);
    // selectedItem.current = undefined;
  };

  const handleChangeColor = (color) => {
    updateItems(selectedItem.current, 'color', color);
  };

  const sanitizeFileTypeInput = (fileTypeInput) =>
    fileTypeInput.replace(/[^a-zA-Z0-9 ]/g, '');

  const dataGridColumns: GridColDef[] = [
    {
      field: 'type',
      headerName: t('core:fileExtension'),
      width: 150,
      renderCell: (params) => renderTypeCell(params.row),
      sortable: false,
      filterable: false,
    },
    {
      field: 'viewer',
      headerName: t('core:fileOpener'),
      width: 200,
      renderCell: (params) => renderViewerCell(params.row),
      sortable: false,
      filterable: false,
    },
    {
      field: 'editor',
      headerName: t('core:fileEditor'),
      width: 200,
      renderCell: (params) => renderEditorCell(params.row),
      sortable: false,
      filterable: false,
    },
  ];

  const onAddFileType = () => {
    const defaultFileTypeObject = {
      id: getUuid(),
      type: '',
      viewer: '',
      editor: '',
      color: '#2196f3',
    };
    items.current = [defaultFileTypeObject, ...items.current];
    setRows([...items.current]);
  };

  const onRemoveItem = (item) => {
    selectedItem.current = item;
    openConfirmDialog(
      t('core:confirm'),
      t('core:confirmFileTypeDeletion'),
      (result) => {
        if (result) {
          removeItem(selectedItem.current);
        }
      },
      'cancelDeleteFileTypeDialog',
      'confirmDeleteFileTypeDialog',
      'confirmDeleteFileTypeDialogContent',
    );
  };

  const removeItem = (itemForRemoval: any) => {
    const filteredItems = items.current.filter(
      (item) => item.type !== itemForRemoval.type,
    );
    items.current = filteredItems;
    setRows([...filteredItems]);
    saveFileTypes(filteredItems);
  };

  function renderTypeCell(item: TS.FileTypes) {
    return (
      <FormControl
        error={
          (isValidationInProgress.current && item.type === '') ||
          items.current.filter((targetItem) => targetItem.type === item.type)
            .length > 1
        }
        sx={{ width: '100%' }}
      >
        <TsTextField
          data-tid={'typeTID' + item.type}
          defaultValue={item.type}
          sx={{
            width: '100%',
            marginTop: 0,
          }}
          error={
            (isValidationInProgress.current && item.type === '') ||
            items.current.filter((targetItem) => targetItem.type === item.type)
              .length > 1
          }
          onBlur={(event) => {
            const nextValue = event.target.value;
            const withoutSpecialChars = sanitizeFileTypeInput(nextValue);
            updateItems(item, 'type', withoutSpecialChars);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <TransparentBackground>
                    <TsButton
                      tooltip={t('core:colorPickerDialogTitle')}
                      data-tid="settingsFileTypes_openColorPicker_"
                      sx={{
                        border: '1px solid lightgray',
                        backgroundColor: `${item.color}`,
                        minWidth: '40px',
                      }}
                      onClick={() => {
                        openColorPicker(item);
                      }}
                    >
                      &nbsp;
                      <div />
                    </TsButton>
                  </TransparentBackground>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <TsIconButton
                    tooltip={t('removeFileType', { itemType: item.type })}
                    data-tid="settingsFileTypes_remove_"
                    onClick={() => onRemoveItem(item)}
                  >
                    <RemoveIcon />
                  </TsIconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </FormControl>
    );
  }

  function renderViewerCell(item: TS.FileTypes) {
    return (
      <FormControl
        fullWidth
        error={isValidationInProgress.current && item.viewer === ''}
      >
        <TsSelect
          data-tid={'viewerTID' + item.type}
          error={isValidationInProgress.current && item.viewer === ''}
          value={item.viewer}
          sx={{ minWidth: '150px', marginTop: 0 }}
          onChange={(event) => {
            const extension: TS.Extension = extensions.find(
              (ext) => ext.extensionId === event.target.value,
            );
            if (extension.extensionExternal) {
              getUserDataDir().then((dataDir) => {
                const externalExtensionPath =
                  dataDir + AppConfig.dirSeparator + 'tsplugins';
                updateItems(
                  item,
                  'extensionExternalPath',
                  externalExtensionPath,
                );
              });
            }
            updateItems(item, 'viewer', extension.extensionId);
          }}
        >
          {extensions.map(
            (extension) =>
              (extension.extensionTypes.includes('viewer') ||
                extension.extensionTypes.includes('editor')) && (
                <MenuItem
                  data-tid={dataTidFormat(
                    extension.extensionName + 'viewerTID' + item.type,
                  )}
                  key={extension.extensionName}
                  value={extension.extensionId}
                  title={'v' + extension.version}
                >
                  {extension.extensionName}
                </MenuItem>
              ),
          )}
        </TsSelect>
      </FormControl>
    );
  }

  function renderEditorCell(item: TS.FileTypes) {
    return (
      <FormControl fullWidth error={isValidationInProgress.current}>
        <TsSelect
          value={item.editor}
          sx={{ minWidth: '150px', marginTop: 0 }}
          onChange={(event) => updateItems(item, 'editor', event.target.value)}
        >
          <MenuItem value="">{t('clearEditor')}</MenuItem>
          {extensions
            .filter(
              (extension) =>
                extension.extensionTypes &&
                extension.extensionTypes.includes('editor'),
            )
            .map((extension) => (
              <MenuItem
                key={extension.extensionName}
                value={extension.extensionId}
                title={'v' + extension.version}
              >
                {extension.extensionName}
              </MenuItem>
            ))}
        </TsSelect>
      </FormControl>
    );
  }

  return (
    <Paper
      data-tid="settingsFileTypesTID"
      sx={{
        height: '100%',
        width: '100%',
        minWidth: '350px',
        overflow: 'hidden',
        background: 'transparent',
        paddingLeft: '10px',
      }}
    >
      <TsButton
        data-tid="addNewFileTypeTID"
        onClick={onAddFileType}
        sx={{
          marginTop: AppConfig.defaultSpaceBetweenButtons,
          marginBottom: AppConfig.defaultSpaceBetweenButtons,
        }}
        startIcon={<CreateFileIcon />}
      >
        {t('core:addNewFileType')}
      </TsButton>
      {devMode && (
        <TsButton
          data-tid="resetFileTypesTID"
          onClick={() => {
            selectedItem.current = undefined;
            items.current = defaultSettings.supportedFileTypes;
            dispatch(SettingsActions.setSupportedFileTypes(supportedFileTypes));
          }}
          variant="text"
          startIcon={<ReloadIcon />}
          sx={{
            // color: 'red',
            margin: AppConfig.defaultSpaceBetweenButtons,
          }}
        >
          {t('core:resetFileType')}
        </TsButton>
      )}
      <DataGrid
        rows={rows}
        columns={dataGridColumns}
        getRowId={(row) => row.id || row.type}
        disableColumnMenu
        // pageSizeOptions={[100]}
        disableRowSelectionOnClick
        // hideFooter
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '4px',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '8px',
          },
        }}
      />
      <ColorPickerDialog
        open={isColorPickerVisible}
        setColor={handleChangeColor}
        onClose={closeColorPicker}
        color={selectedItem.current && selectedItem.current.color}
      />
    </Paper>
  );
}

export default SettingsFileTypes;
