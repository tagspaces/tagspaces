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
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircle';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import ColorPickerDialog from '../ColorPickerDialog';
import { findAvailableExtensions } from '-/reducers/settings-default';
// import { sortBy } from '-/utils/misc';
import i18n from '-/services/i18n';
import TransparentBackground from '../../TransparentBackground';

const styles: any = (theme: any) => ({
  root: {
    background: theme.palette.background.paper
  },
  fileExtension: {
    width: '15%',
    padding: '0 12px 0 0'
  },
  fileType: {
    paddingBottom: 0,
    paddingTop: 0,
    paddingRight: 0,
    padding: '0 12px 0 0'
  },
  fileOpener: {
    width: '25%',
    padding: '0 12px 0 0'
  },
  fileTypeColorDialog: {
    width: '15%',
    padding: '0 12px 0 0'
  },
  fileTypeColorDialogButton: {
    width: '100px',
    padding: '0 10px 0 0'
  },
  colorChooserButton: {
    maxWidth: 30,
    width: 30,
    border: '1px solid lightgray'
  },
  fileExtRemove: {
    width: '7%',
    height: '38px',
    cursor: 'pointer',
    padding: '0'
  }
});

interface Props {
  items: Array<any>;
  classes: any;
  updateItems: Function;
  selectedItem: any;
  setSelectedItem: Function;
  isValidationInProgress: boolean;
  onRemoveItem: Function;
}

const SettingsFileTypes = (props: Props) => {
  const [isColorPickerVisible, setColorPickerVisible] = useState<boolean>(
    false
  );
  const availableExtensions = findAvailableExtensions();

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
    selectedItem,
    updateItems = () => {},
    onRemoveItem = () => {},
    isValidationInProgress = false
  } = props;

  /* const modifiedItems = !isComponentActive
      ? sortBy(items, 'type', 'string', 'asc')
      : items; */

  return (
    <div className={classes.root}>
      <ColorPickerDialog
        open={isColorPickerVisible}
        setColor={handleChangeColor}
        onClose={closeColorPicker}
        color={selectedItem.color}
      />

      {items.map(item => (
        <ListItem
          data-id={item.id}
          key={item.id}
          className={classes.fileType}
          style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '16px 0',
            alignItems: 'flex-end'
          }}
        >
          <FormControl
            className={classes.fileExtension}
            error={
              (isValidationInProgress && item.type === '') ||
              items.filter(targetItem => targetItem.type === item.type).length >
                1
            }
          >
            <InputLabel htmlFor="name-disabled" data-shrink={false}>
              {i18n.t('core:fileExtension')}
            </InputLabel>
            <Input
              defaultValue={item.type}
              error={
                (isValidationInProgress && item.type === '') ||
                items.filter(targetItem => targetItem.type === item.type)
                  .length > 1
              }
              /* onChange={event => {
                event.persist();
                const nextValue = event.target.value;
                const withoutSpecialChars = sanitizeFileTypeInput(nextValue);
                updateItems(
                  'type',
                  item.type,
                  'type',
                  withoutSpecialChars,
                  true
                );
              }} */
              onBlur={event => {
                const nextValue = event.target.value;
                const withoutSpecialChars = sanitizeFileTypeInput(nextValue);
                updateItems('type', item.type, 'type', withoutSpecialChars);
              }}
            />
          </FormControl>
          <FormControl
            className={classes.fileOpener}
            error={isValidationInProgress && item.viewer === ''}
          >
            <InputLabel htmlFor="">{i18n.t('core:fileOpener')}</InputLabel>
            <Select
              error={isValidationInProgress && item.viewer === ''}
              value={item.viewer}
              input={<Input id="" />}
              onChange={event =>
                updateItems('id', item.id, 'viewer', event.target.value)
              }
            >
              <MenuItem value="" />
              {availableExtensions.map(
                extension =>
                  (extension.extensionType === 'viewer' ||
                    extension.extensionType === 'editor') && (
                    <MenuItem
                      key={extension.extensionName}
                      value={extension.extensionId}
                    >
                      {extension.extensionName}
                    </MenuItem>
                  )
              )}
            </Select>
          </FormControl>
          <FormControl className={classes.fileOpener}>
            <InputLabel htmlFor="">{i18n.t('core:fileEditor')}</InputLabel>
            <Select
              value={item.editor}
              input={<Input id="" />}
              onChange={event =>
                updateItems('id', item.id, 'editor', event.target.value)
              }
            >
              <MenuItem value="" />
              {availableExtensions
                .filter(extension => extension.extensionType === 'editor')
                .map(extension => (
                  <MenuItem
                    key={extension.extensionName}
                    value={extension.extensionId}
                  >
                    {extension.extensionName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl className={classes.fileTypeColorDialogButton}>
            <TransparentBackground>
              <Button
                data-tid="settingsFileTypes_openColorPicker_"
                className={classes.colorChooserButton}
                style={{
                  backgroundColor: `${item.color}`,
                  minWidth: '100px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  openColorPicker(item);
                }}
              >
                &nbsp;
                <div style={styles.color} />
              </Button>
            </TransparentBackground>
          </FormControl>
          <IconButton
            data-tid="settingsFileTypes_remove_"
            className={classes.fileExtRemove}
            title={i18n.t('removeFileType', { itemType: item.type })}
            onClick={() => onRemoveItem(item)}
          >
            <RemoveIcon />
          </IconButton>
        </ListItem>
      ))}
    </div>
  );
};

export default withStyles(styles)(SettingsFileTypes);
