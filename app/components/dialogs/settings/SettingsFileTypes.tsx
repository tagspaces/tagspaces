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

import React, { useState } from 'react';
import withStyles from '@mui/styles/withStyles';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
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
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import Tooltip from '-/components/Tooltip';
import ColorPickerDialog from '-/components/dialogs/ColorPickerDialog';
import i18n from '-/services/i18n';
import TransparentBackground from '-/components/TransparentBackground';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';

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
  items: Array<TS.FileTypes>;
  classes: any;
  updateItems: Function;
  selectedItem: any;
  setSelectedItem: Function;
  isValidationInProgress: boolean;
  onRemoveItem: Function;
  extensions: Array<TS.Extension>;
}

function SettingsFileTypes(props: Props) {
  const [isColorPickerVisible, setColorPickerVisible] = useState<boolean>(
    false
  );

  const openColorPicker = selectedItem => {
    const { setSelectedItem } = props;
    setColorPickerVisible(true);
    setSelectedItem(selectedItem);
  };

  const closeColorPicker = () => {
    const { setSelectedItem } = props;
    setColorPickerVisible(false);
    setSelectedItem({});
  };

  const handleChangeColor = color => {
    const { updateItems, selectedItem } = props;
    updateItems('id', selectedItem.id, 'color', color);
  };

  const sanitizeFileTypeInput = fileTypeInput =>
    fileTypeInput.replace(/[^a-zA-Z0-9 ]/g, '');

  const {
    classes,
    items,
    extensions,
    selectedItem,
    updateItems = () => {},
    onRemoveItem = () => {},
    isValidationInProgress = false
  } = props;

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
              (isValidationInProgress && item.type === '') ||
              items.filter(targetItem => targetItem.type === item.type).length >
                1
            }
          >
            <Input
              defaultValue={item.type}
              error={
                (isValidationInProgress && item.type === '') ||
                items.filter(targetItem => targetItem.type === item.type)
                  .length > 1
              }
              onBlur={event => {
                const nextValue = event.target.value;
                const withoutSpecialChars = sanitizeFileTypeInput(nextValue);
                updateItems('type', item.type, 'type', withoutSpecialChars);
              }}
            />
          </FormControl>
        </TableCell>
        <TableCell align={'left'} sx={{ padding: '0 5px 20px 0' }}>
          <FormControl error={isValidationInProgress && item.viewer === ''}>
            <Select
              error={isValidationInProgress && item.viewer === ''}
              value={item.viewer}
              sx={{ width: 180 }}
              input={<Input id="" />}
              onChange={event =>
                updateItems('id', item.id, 'viewer', event.target.value)
              }
            >
              <MenuItem value="" />
              {extensions.map(
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
            onChange={event =>
              updateItems('id', item.id, 'editor', event.target.value)
            }
          >
            <MenuItem value="">{i18n.t('clearEditor')}</MenuItem>
            {extensions
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
          <Tooltip title={i18n.t('core:delete')}>
            <IconButton
              data-tid="settingsFileTypes_remove_"
              className={classes.fileExtRemove}
              title={i18n.t('removeFileType', { itemType: item.type })}
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
        <TableVirtuoso
          style={{
            overflowX: 'hidden',
            // @ts-ignore
            overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
          }}
          data={items}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>

      <ColorPickerDialog
        open={isColorPickerVisible}
        setColor={handleChangeColor}
        onClose={closeColorPicker}
        color={selectedItem.color}
      />
    </>
  );
}

export default withStyles(styles)(SettingsFileTypes);
