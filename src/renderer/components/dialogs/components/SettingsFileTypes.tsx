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
import { RemoveIcon } from '-/components/CommonIcons';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  TableComponents,
  TableVirtuoso,
  TableVirtuosoHandle,
} from 'react-virtuoso';

function SettingsFileTypes() {
  const { t } = useTranslation();
  const { extensions } = useExtensionsContext();
  const { openConfirmDialog } = useNotificationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const items = useRef<Array<TS.FileTypes>>(supportedFileTypes);
  const selectedItem = useRef<TS.FileTypes>(undefined);
  const isValidationInProgress = useRef<boolean>(false);
  const [isColorPickerVisible, setColorPickerVisible] =
    useState<boolean>(false);
  const settingsFileTypeRef = useRef<TableVirtuosoHandle>(null);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  //const extensions = useSelector(getExtensions);
  const devMode = useSelector(isDevMode);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!firstRender) {
      items.current = supportedFileTypes;
      isValidationInProgress.current = false;
      if (selectedItem.current !== undefined) {
        const timer = scrollToItem(selectedItem.current);
        return () => {
          if (timer) {
            clearTimeout(timer);
          }
        };
      }
    }
  }, [supportedFileTypes]);

  type ScrollToIndexArgs = {
    index: number;
    align?: 'start' | 'center' | 'end';
  };

  function scrollToItem(item: TS.FileTypes) {
    if (item) {
      const index = items.current.findIndex(
        (element) => element.type === item.type,
      );
      if (index > -1) {
        return setTimeout(function () {
          scrollToIndex({ index: index });
        }, 50);
      }
    }
    return undefined;
  }

  function scrollToIndex({ index, align = 'start' }: ScrollToIndexArgs) {
    if (settingsFileTypeRef.current) {
      settingsFileTypeRef.current.scrollToIndex({
        index,
        align,
      });
    }
  }

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
    if (
      (targetKey !== 'type' && isSaveable && !disableSave) ||
      (targetKey === 'type' && hasViewer && isSaveable && !disableSave)
    ) {
      saveFileTypes(modifiedItems);
    } else {
      isValidationInProgress.current = true;
      forceUpdate();
    }
  };

  const saveFileTypes = (newItems) => {
    isValidationInProgress.current = true;

    const isValid = validateSelectedFileTypes(newItems);

    if (!isValid) {
      forceUpdate();
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
    scrollToItem(selected);
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

  interface ColumnData {
    dataKey: keyof TS.FileTypes;
    label: string;
    width?: number | string;
  }

  const columns: ColumnData[] = [
    {
      width: '130px',
      label: t('core:fileExtension'),
      dataKey: 'type',
    },
    {
      width: '170px',
      label: t('core:fileOpener'),
      dataKey: 'viewer',
    },
    {
      width: '170px',
      label: t('core:fileEditor'),
      dataKey: 'editor',
    },
  ];

  const VirtuosoTableComponents: TableComponents<TS.FileTypes> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <Table
        {...props}
        sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
      />
    ),
    //TableHead: CustomTableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  const onAddFileType = () => {
    const defaultFileTypeObject = {
      id: getUuid(),
      type: '',
      viewer: '',
      editor: '',
      color: '#2196f3',
    };
    items.current = [defaultFileTypeObject, ...items.current];
    forceUpdate();
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
    saveFileTypes(filteredItems);
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={'center'}
            sx={{
              width: column.width,
              padding: 0,
              paddingLeft: 2,
              backgroundColor: 'background.paper',
            }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(_index: number, item: TS.FileTypes) {
    return (
      <React.Fragment>
        <TableCell
          align={'left'}
          sx={{ maxWidth: 160, padding: '0 5px 0px 5px' }}
        >
          <FormControl
            error={
              (isValidationInProgress.current && item.type === '') ||
              items.current.filter(
                (targetItem) => targetItem.type === item.type,
              ).length > 1
            }
          >
            <TsTextField
              data-tid={'typeTID' + item.type}
              defaultValue={item.type}
              sx={{
                width: '160px',
                marginTop: 0,
              }}
              error={
                (isValidationInProgress.current && item.type === '') ||
                items.current.filter(
                  (targetItem) => targetItem.type === item.type,
                ).length > 1
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
        </TableCell>
        <TableCell
          align={'center'}
          sx={{ minWith: 150, padding: '0 5px 0px 25px' }}
        >
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
        </TableCell>
        <TableCell align={'center'} sx={{ padding: '0 5px 0px 0' }}>
          <FormControl fullWidth error={isValidationInProgress.current}>
            <TsSelect
              value={item.editor}
              sx={{ minWidth: '150px', marginTop: 0 }}
              onChange={(event) =>
                updateItems(item, 'editor', event.target.value)
              }
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
        </TableCell>
      </React.Fragment>
    );
  }

  return (
    <Paper
      data-tid="settingsFileTypesTID"
      sx={{
        height: '500px',
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
        color="secondary"
        sx={{
          marginTop: AppConfig.defaultSpaceBetweenButtons,
          marginBottom: AppConfig.defaultSpaceBetweenButtons,
        }}
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
          color="secondary"
          sx={{
            margin: AppConfig.defaultSpaceBetweenButtons,
          }}
        >
          {t('core:resetFileType')}
        </TsButton>
      )}
      <TableVirtuoso
        style={{
          overflowX: 'auto',
          height: 'calc(100% - 50px)',
          minWidth: 350,
          overflowY: 'auto',
          background: 'transparent',
        }}
        data={items.current}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
        ref={settingsFileTypeRef}
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
