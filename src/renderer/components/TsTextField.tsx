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

import AppConfig from '-/AppConfig';
import TsMenuList from '-/components/TsMenuList';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { isDesktopMode } from '-/reducers/settings';
import { Box } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

type TSTextFieldProps = TextFieldProps & {
  updateValue?: (string) => void;
  retrieveValue?: () => string;
};

function TsTextField(props: TSTextFieldProps) {
  const { updateValue, retrieveValue, children, sx, label, ...restProps } =
    props;
  const theme = useTheme();
  const { t } = useTranslation();
  const desktopMode = useSelector(isDesktopMode);
  //const textFieldRef = useRef(null);

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
    <Box>
      {label && (
        <FormHelperText sx={{ marginLeft: '5px', marginTop: 0 }}>
          {label}
        </FormHelperText>
      )}
      <TextField
        onContextMenu={handleContextMenu}
        margin="dense"
        size={desktopMode ? 'small' : 'medium'}
        variant="outlined"
        fullWidth
        sx={{
          cursor: 'context-menu',
          marginTop: 0,
          backgroundColor: alpha(theme.palette.divider, 0.2),
          '&:hover': {
            backgroundColor: alpha(theme.palette.divider, 0.5),
          },
          '& .Mui-focused': {
            backgroundColor: 'transparent !important',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          borderRadius: AppConfig.defaultCSSRadius,
          transition: '0.3s',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '2px solid transparent !important',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '2px solid transparent',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: `2px solid ${alpha(theme.palette.divider, 0.5)} !important`,
            borderRadius: AppConfig.defaultCSSRadius,
          },
          ...sx,
        }}
        {...restProps}
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
        <TsMenuList sx={{ minWidth: 150 }}>
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
        </TsMenuList>
      </Menu>
    </Box>
  );
}

export default TsTextField;
