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
import {
  Box,
  InputAdornment,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

// Memoized cell components to prevent unnecessary re-renders
interface TypeCellProps {
  item: TS.FileTypes;
  onUpdateItems: (fileType: TS.FileTypes, key: string, value: any) => void;
  onOpenColorPicker: (item: TS.FileTypes) => void;
  isValidationInProgress: boolean;
  allItems: TS.FileTypes[];
  sanitizeInput: (input: string) => string;
  t: any;
}

const TypeCell = React.memo(
  ({
    item,
    onUpdateItems,
    onOpenColorPicker,
    isValidationInProgress,
    allItems,
    sanitizeInput,
    t,
  }: TypeCellProps) => {
    const hasDuplicates =
      allItems.filter((targetItem) => targetItem.type === item.type).length > 1;
    const isError =
      (isValidationInProgress && item.type === '') || hasDuplicates;

    return (
      <TsTextField
        data-tid={'typeTID' + item.type}
        defaultValue={item.type}
        sx={{
          width: '100%',
          marginTop: 0,
        }}
        error={isError}
        onBlur={(event) => {
          const nextValue = event.target.value;
          const withoutSpecialChars = sanitizeInput(nextValue);
          onUpdateItems(item, 'type', withoutSpecialChars);
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
                      onOpenColorPicker(item);
                    }}
                  >
                    &nbsp;
                    <div />
                  </TsButton>
                </TransparentBackground>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
);
TypeCell.displayName = 'TypeCell';

interface ViewerCellProps {
  item: TS.FileTypes;
  extensions: TS.Extension[];
  onUpdateItems: (fileType: TS.FileTypes, key: string, value: any) => void;
  isValidationInProgress: boolean;
  t: any;
}

const ViewerCell = React.memo(
  ({
    item,
    extensions,
    onUpdateItems,
    isValidationInProgress,
    t,
  }: ViewerCellProps) => {
    const viewerExtensions = extensions.filter(
      (ext) =>
        ext.extensionTypes.includes('viewer') ||
        ext.extensionTypes.includes('editor'),
    );

    return (
      <TsSelect
        data-tid={'viewerTID' + item.type}
        error={isValidationInProgress && item.viewer === ''}
        value={item.viewer}
        sx={{ minWidth: '150px', marginTop: 0 }}
        onChange={(event) => {
          const extension = extensions.find(
            (ext) => ext.extensionId === event.target.value,
          );
          if (extension?.extensionExternal) {
            getUserDataDir().then((dataDir) => {
              const externalExtensionPath =
                dataDir + AppConfig.dirSeparator + 'tsplugins';
              onUpdateItems(
                item,
                'extensionExternalPath',
                externalExtensionPath,
              );
            });
          }
          onUpdateItems(item, 'viewer', extension.extensionId);
        }}
      >
        {viewerExtensions.map((extension) => (
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
        ))}
      </TsSelect>
    );
  },
);
ViewerCell.displayName = 'ViewerCell';

interface EditorCellProps {
  item: TS.FileTypes;
  extensions: TS.Extension[];
  onUpdateItems: (fileType: TS.FileTypes, key: string, value: any) => void;
  isValidationInProgress: boolean;
  t: any;
}

const EditorCell = React.memo(
  ({
    item,
    extensions,
    onUpdateItems,
    isValidationInProgress,
    t,
  }: EditorCellProps) => {
    const editorExtensions = extensions.filter((ext) =>
      ext.extensionTypes.includes('editor'),
    );

    return (
      <TsSelect
        value={item.editor}
        sx={{ minWidth: '150px', marginTop: 0 }}
        onChange={(event) => onUpdateItems(item, 'editor', event.target.value)}
      >
        <MenuItem value="">{t('clearEditor')}</MenuItem>
        {editorExtensions.map((extension) => (
          <MenuItem
            key={extension.extensionName}
            value={extension.extensionId}
            title={'v' + extension.version}
          >
            {extension.extensionName}
          </MenuItem>
        ))}
      </TsSelect>
    );
  },
);
EditorCell.displayName = 'EditorCell';

interface ActionCellProps {
  item: TS.FileTypes;
  onRemoveItem: (item: TS.FileTypes) => void;
  t: any;
}

const ActionCell = React.memo(({ item, onRemoveItem, t }: ActionCellProps) => (
  <TsIconButton
    sx={{ marginTop: '-15px' }}
    tooltip={t('removeFileType', { itemType: item.type })}
    data-tid="settingsFileTypes_remove_"
    onClick={() => onRemoveItem(item)}
    size="small"
  >
    <RemoveIcon />
  </TsIconButton>
));
ActionCell.displayName = 'ActionCell';

function SettingsFileTypes() {
  const { t } = useTranslation();
  const { extensions } = useExtensionsContext();
  const { openConfirmDialog } = useNotificationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Helper function to create deep copies of file types to break refs to frozen Redux objects
  const deepCopyFileTypes = (fileTypes: Array<TS.FileTypes>) =>
    fileTypes.map((ft) => ({ ...ft }));

  // Helper function to sort file types by type name
  const sortFileTypes = (fileTypes: Array<TS.FileTypes>) =>
    [...fileTypes].sort((a, b) =>
      a.type.toLowerCase().localeCompare(b.type.toLowerCase()),
    );

  const items = useRef<Array<TS.FileTypes>>(
    sortFileTypes(deepCopyFileTypes(supportedFileTypes)),
  );
  const selectedItem = useRef<TS.FileTypes>(undefined);
  const isValidationInProgress = useRef<boolean>(false);
  const dataGridRef = useRef(null);
  const [isColorPickerVisible, setColorPickerVisible] =
    useState<boolean>(false);
  const [rows, setRows] = useState<Array<TS.FileTypes>>(
    sortFileTypes(deepCopyFileTypes(supportedFileTypes)),
  );
  const [filterValue, setFilterValue] = useState<string>('');

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  //const extensions = useSelector(getExtensions);
  const devMode = useSelector(isDevMode);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!firstRender) {
      const sortedTypes = sortFileTypes(deepCopyFileTypes(supportedFileTypes));
      items.current = sortedTypes;
      setRows(sortedTypes);
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

  const getFilteredRows = () => {
    if (!filterValue.trim()) {
      return items.current;
    }
    const lowerFilter = filterValue.toLowerCase();
    return items.current.filter((item) =>
      item.type.toLowerCase().includes(lowerFilter),
    );
  };

  const dataGridColumns: GridColDef[] = [
    {
      field: 'type',
      headerName: t('core:fileExtension'),
      width: 140,
      renderCell: (params) => (
        <TypeCell
          item={params.row}
          onUpdateItems={updateItems}
          onOpenColorPicker={openColorPicker}
          isValidationInProgress={isValidationInProgress.current}
          allItems={items.current}
          sanitizeInput={sanitizeFileTypeInput}
          t={t}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'viewer',
      headerName: t('core:fileOpener'),
      width: 160,
      renderCell: (params) => (
        <ViewerCell
          item={params.row}
          extensions={extensions}
          onUpdateItems={updateItems}
          isValidationInProgress={isValidationInProgress.current}
          t={t}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'editor',
      headerName: t('core:fileEditor'),
      width: 160,
      renderCell: (params) => (
        <EditorCell
          item={params.row}
          extensions={extensions}
          onUpdateItems={updateItems}
          isValidationInProgress={isValidationInProgress.current}
          t={t}
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      renderCell: (params) => (
        <ActionCell item={params.row} onRemoveItem={onRemoveItem} t={t} />
      ),
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
    // Scroll to top after adding
    setTimeout(() => {
      if (dataGridRef.current) {
        const virtualScroller = dataGridRef.current.querySelector(
          '.MuiDataGrid-virtualScroller',
        );
        if (virtualScroller) {
          virtualScroller.scrollTop = 0;
        }
      }
    }, 0);
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          paddingTop: AppConfig.defaultSpaceBetweenButtons,
        }}
      >
        <TsTextField
          placeholder={t('filterByFileExtension')}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          size="small"
          sx={{
            maxWidth: '150px',
            marginRight: AppConfig.defaultSpaceBetweenButtons,
          }}
        />
        <TsButton
          data-tid="addNewFileTypeTID"
          onClick={onAddFileType}
          tooltip={t('core:addNewFileType')}
          sx={{
            marginRight: AppConfig.defaultSpaceBetweenButtons,
          }}
          startIcon={<CreateFileIcon />}
        >
          {t('core:addNewFileType')}
        </TsButton>
        {devMode && (
          <TsButton
            data-tid="resetFileTypesTID"
            onClick={() => {
              openConfirmDialog(
                t('core:confirm'),
                t('core:confirmResetFileTypes'),
                (result) => {
                  if (result) {
                    selectedItem.current = undefined;
                    items.current = [...defaultSettings.supportedFileTypes];
                    setRows([...defaultSettings.supportedFileTypes]);
                    dispatch(
                      SettingsActions.setSupportedFileTypes(
                        defaultSettings.supportedFileTypes,
                      ),
                    );
                  }
                },
                'cancelResetFileTypesDialog',
                'confirmResetFileTypesDialog',
                'confirmResetFileTypesDialogContent',
              );
            }}
            color="error"
            startIcon={<ReloadIcon />}
          >
            {t('core:resetFileType')}
          </TsButton>
        )}
      </Box>
      <div
        style={{
          height: smallScreen ? 'calc(100% - 80px)' : 'calc(100% - 50px)',
          width: '100%',
        }}
      >
        <DataGrid
          ref={dataGridRef}
          rows={getFilteredRows()}
          columns={dataGridColumns}
          getRowId={(row) => row.id || row.type}
          disableColumnMenu
          // pageSizeOptions={[100]}
          disableRowSelectionOnClick
          disableColumnSelector
          rowHeight={60}
          // hideFooter
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
          }}
        />
      </div>
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
