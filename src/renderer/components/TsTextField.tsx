/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { useTranslation } from 'react-i18next';
import { isDesktopMode } from '-/reducers/settings';

type TSTextFieldProps = TextFieldProps & {
  updateValue?: (string) => void;
  retrieveValue?: () => string;
};

function TsTextField(props: TSTextFieldProps) {
  const { updateValue, retrieveValue, children, label } = props;
  const { t } = useTranslation();
  const desktopMode = useSelector(isDesktopMode);
  const textFieldRef = useRef(null);

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  async function handleCopy() {
    try {
      const selection = document.getSelection()?.toString();
      let text4Clipboard = '';
      if (selection) {
        text4Clipboard = selection;
      } else if (retrieveValue) {
        text4Clipboard = retrieveValue();
      }
      await navigator.clipboard.writeText(text4Clipboard);
      handleClose();
    } catch (error) {
      console.error(error.message);
      handleClose();
    }
  }

  async function handlePaste() {
    if (updateValue) {
      navigator.clipboard.readText().then((clipText) => {
        const value = retrieveValue ? retrieveValue() : '';
        const selection = document.getSelection()?.toString();
        let result = '';
        if (selection && value?.includes(selection)) {
          result = value.replace(selection, clipText);
        } else {
          result = value + clipText;
        }
        updateValue(result);
        handleClose();
      });
    }
  }

  return (
    <div>
      {label && (
        <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
          {label}
        </FormHelperText>
      )}
      <TextField
        onContextMenu={handleContextMenu}
        style={{
          cursor: 'context-menu',
          marginTop: 0,
        }}
        margin="dense"
        size={desktopMode ? 'small' : 'medium'}
        variant="outlined"
        fullWidth={true}
        ref={textFieldRef}
        {...props}
        label={undefined}
      >
        {children}
      </TextField>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuList dense style={{ minWidth: 150 }}>
          <MenuItem onClick={handleCopy}>
            <ListItemText primary={t('core:copy')} />
            <MenuKeyBinding keyBinding="command+c" />
          </MenuItem>
          {updateValue && (
            <MenuItem onClick={handlePaste}>
              <ListItemText primary={t('core:paste')} />
              <MenuKeyBinding keyBinding="command+v" />
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </div>
  );
}

export default TsTextField;
