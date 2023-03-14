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

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import withStyles from '@mui/styles/withStyles';
import MenuItem from '@mui/material/MenuItem';
import Input from '@mui/material/Input';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/RemoveCircle';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  TableVirtuoso,
  TableComponents,
  TableVirtuosoHandle
} from 'react-virtuoso';
import Tooltip from '-/components/Tooltip';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import i18n from '-/services/i18n';
import TransparentBackground from '-/components/TransparentBackground';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';
import {
  actions as SettingsActions,
  getSupportedFileTypes,
  isDevMode
} from '-/reducers/settings';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import PlatformFacade from '-/services/platform-facade';
import { getExtensions } from '-/reducers/app';
import { supportedFileTypes } from '-/extension-config';

const styles: any = (theme: any) => ({
  fileTypeColorDialog: {
    width: 60,
    padding: '0 12px 0 0'
  },
  colorChooserButton: {
    maxWidth: 30,
    width: 30,
    border: '1px solid lightgray'
  },
  fileExtRemove: {
    height: '38px',
    cursor: 'pointer',
    marginLeft: 10,
    padding: '0'
  }
});

interface Props {
  supportedFileTypes: Array<TS.FileTypes>;
  setSupportedFileTypes?: (fileTypes: Array<any>) => void;
  classes: any;
  extensions: Array<TS.Extension>;
  isDevMode: boolean;
}

function SettingsFileTypes(props: Props) {
  const items = useRef<Array<TS.FileTypes>>(props.supportedFileTypes);
  const selectedItem = useRef<TS.FileTypes>(undefined);
  const isValidationInProgress = useRef<boolean>(false);
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState<boolean>(
    false
  );
  const [isColorPickerVisible, setColorPickerVisible] = useState<boolean>(
    false
  );
  const settingsFileTypeRef = useRef<TableVirtuosoHandle>(null);

  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    items.current = props.supportedFileTypes;
    isValidationInProgress.current = false;
    const timer = scrollToItem(selectedItem.current);
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [props.supportedFileTypes]);

  type ScrollToIndexArgs = {
    index: number;
    align?: 'start' | 'center' | 'end';
  };

  function scrollToItem(item: TS.FileTypes) {
    if (item) {
      const index = items.current.findIndex(
        element => element.type === item.type
      );
      if (index > -1) {
        return setTimeout(function() {
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
        align
      });
    }
  }

  const updateItems = (
    fileType: TS.FileTypes,
    targetKey,
    targetValue,
    disableSave = false
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
    const modifiedItems = items.current.map(item => {
      if (item[identifierKey] === identifierValue) {
        isSaveable =
          item.type !== '' || (targetKey === 'type' && targetValue !== '');
        hasViewer = item.viewer !== '';
        const itemUpdated = {
          ...item,
          [targetKey]: targetValue
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

  const saveFileTypes = newItems => {
    isValidationInProgress.current = true;

    const isValid = validateSelectedFileTypes(newItems);

    if (!isValid) {
      forceUpdate();
      return false;
    }
    props.setSupportedFileTypes(newItems);
  };

  const validateSelectedFileTypes = newItems => {
    let isValid = true;

    newItems.map(item => {
      const hasDuplicates =
        items.current.filter(targetItem => targetItem.type === item.type)
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

  const openColorPicker = selected => {
    setColorPickerVisible(true);
    selectedItem.current = selected;
    scrollToItem(selected);
  };

  const closeColorPicker = () => {
    setColorPickerVisible(false);
    // selectedItem.current = undefined;
  };

  const handleChangeColor = color => {
    updateItems(selectedItem.current, 'color', color);
  };

  const sanitizeFileTypeInput = fileTypeInput =>
    fileTypeInput.replace(/[^a-zA-Z0-9 ]/g, '');

  const { classes } = props;

  interface ColumnData {
    dataKey: keyof TS.FileTypes;
    label: string;
    width: number;
  }

  const columns: ColumnData[] = [
    {
      width: 60,
      label: i18n.t('core:fileExtension'),
      dataKey: 'type'
    },
    {
      width: 170,
      label: i18n.t('core:fileOpener'),
      dataKey: 'viewer'
    },
    {
      width: 170,
      label: i18n.t('core:fileEditor'),
      dataKey: 'editor'
    },
    {
      width: 80,
      label: i18n.t('core:actions'),
      dataKey: 'color'
    }
  ];

  const VirtuosoTableComponents: TableComponents<TS.FileTypes> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: props => (
      <Table
        {...props}
        sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
      />
    ),
    TableHead,
    TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    ))
  };

  const onAddFileType = () => {
    const defaultFileTypeObject = {
      id: getUuid(),
      type: '',
      viewer: '',
      editor: '',
      color: '#2196f3'
    };
    items.current = [defaultFileTypeObject, ...items.current];
    forceUpdate();
  };

  const onRemoveItem = item => {
    selectedItem.current = item;
    setIsConfirmDialogOpened(true);
  };

  const removeItem = (itemForRemoval: any) => {
    const filteredItems = items.current.filter(
      item => item.type !== itemForRemoval.type
    );
    items.current = filteredItems;
    saveFileTypes(filteredItems);
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map(column => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align={'center'}
            sx={{
              width: column.width,
              padding: 0,
              paddingLeft: 2,
              backgroundColor: 'background.paper'
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
        <TableCell sx={{ padding: '0 5px 20px 5px' }}>
          <FormControl
            error={
              (isValidationInProgress.current && item.type === '') ||
              items.current.filter(targetItem => targetItem.type === item.type)
                .length > 1
            }
          >
            <Input
              defaultValue={item.type}
              error={
                (isValidationInProgress.current && item.type === '') ||
                items.current.filter(
                  targetItem => targetItem.type === item.type
                ).length > 1
              }
              onBlur={event => {
                const nextValue = event.target.value;
                const withoutSpecialChars = sanitizeFileTypeInput(nextValue);
                updateItems(item, 'type', withoutSpecialChars);
              }}
            />
          </FormControl>
        </TableCell>
        <TableCell align={'left'} sx={{ padding: '0 5px 20px 0' }}>
          <FormControl
            error={isValidationInProgress.current && item.viewer === ''}
          >
            <Select
              error={isValidationInProgress.current && item.viewer === ''}
              value={item.viewer}
              sx={{ width: 180 }}
              input={<Input id="" />}
              onChange={event => {
                const extension: TS.Extension = props.extensions.find(
                  ext => ext.extensionId === event.target.value
                );
                if (extension.extensionExternal) {
                  PlatformFacade.getUserDataDir().then(dataDir => {
                    const externalExtensionPath =
                      dataDir + PlatformFacade.getDirSeparator() + 'tsplugins';
                    updateItems(
                      item,
                      'extensionExternalPath',
                      externalExtensionPath
                    );
                  });
                }
                updateItems(item, 'viewer', extension.extensionId);
              }}
            >
              <MenuItem value="" />
              {props.extensions.map(
                extension =>
                  (extension.extensionTypes.includes('viewer') ||
                    extension.extensionTypes.includes('editor')) && (
                    <MenuItem
                      key={extension.extensionName}
                      value={extension.extensionId}
                    >
                      {extension.extensionName} ({extension.version})
                    </MenuItem>
                  )
              )}
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align={'right'} sx={{ padding: '0 5px 20px 0' }}>
          <Select
            value={item.editor}
            input={<Input id="" />}
            sx={{ width: 180 }}
            onChange={event => updateItems(item, 'editor', event.target.value)}
          >
            <MenuItem value="">{i18n.t('clearEditor')}</MenuItem>
            {props.extensions
              .filter(
                extension =>
                  extension.extensionTypes &&
                  extension.extensionTypes.includes('editor')
              )
              .map(extension => (
                <MenuItem
                  key={extension.extensionName}
                  value={extension.extensionId}
                >
                  {extension.extensionName} ({extension.version})
                </MenuItem>
              ))}
          </Select>
        </TableCell>
        <TableCell sx={{ padding: '0 5px 20px 5px' }}>
          <TransparentBackground>
            <Tooltip title={i18n.t('core:colorPickerDialogTitle')}>
              <Button
                data-tid="settingsFileTypes_openColorPicker_"
                className={classes.colorChooserButton}
                style={{
                  backgroundColor: `${item.color}`,
                  minWidth: 50,
                  maxWidth: 50,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  openColorPicker(item);
                }}
              >
                &nbsp;
                <div style={styles.color} />
              </Button>
            </Tooltip>
          </TransparentBackground>
          <Tooltip title={i18n.t('removeFileType', { itemType: item.type })}>
            <IconButton
              data-tid="settingsFileTypes_remove_"
              className={classes.fileExtRemove}
              onClick={() => onRemoveItem(item)}
              size="large"
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </React.Fragment>
    );
  }

  return (
    <>
      <Paper
        style={{
          height: 600,
          width: '100%',
          minWidth: 550,
          overflow: 'hidden'
        }}
      >
        <Button
          data-tid="addNewFileTypeTID"
          onClick={onAddFileType}
          color="secondary"
          style={{ width: '50%' }}
        >
          {i18n.t('core:addNewFileType')}
        </Button>
        {props.isDevMode && (
          <Button
            data-tid="resetFileTypesTID"
            onClick={() => {
              selectedItem.current = undefined;
              items.current = supportedFileTypes;
              props.setSupportedFileTypes(supportedFileTypes);
            }}
            color="secondary"
            style={{ width: '50%' }}
          >
            {i18n.t('core:resetFileType')}
          </Button>
        )}
        {isConfirmDialogOpened && (
          <ConfirmDialog
            open={isConfirmDialogOpened}
            onClose={() => {
              setIsConfirmDialogOpened(false);
            }}
            title="Confirm"
            content={i18n.t('core:confirmFileTypeDeletion')}
            confirmCallback={result => {
              if (result) {
                removeItem(selectedItem.current);
              }
            }}
            cancelDialogTID="cancelDeleteFileTypeDialog"
            confirmDialogTID="confirmDeleteFileTypeDialog"
            confirmDialogContentTID="confirmDeleteFileTypeDialogContent"
          />
        )}
        <TableVirtuoso
          style={{
            overflowX: 'hidden',
            height: 'calc(100% - 30px)',
            // @ts-ignore
            overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
          }}
          data={items.current}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
          ref={settingsFileTypeRef}
        />
      </Paper>

      <ColorPickerDialog
        open={isColorPickerVisible}
        setColor={handleChangeColor}
        onClose={closeColorPicker}
        color={selectedItem.current && selectedItem.current.color}
      />
    </>
  );
}

const mapStateToProps = state => ({
  supportedFileTypes: getSupportedFileTypes(state),
  extensions: getExtensions(state),
  isDevMode: isDevMode(state)
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setSupportedFileTypes: SettingsActions.setSupportedFileTypes
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SettingsFileTypes));
