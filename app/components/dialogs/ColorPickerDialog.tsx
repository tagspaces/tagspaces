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
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import { SketchPicker } from 'react-color';
import i18n from '-/services/i18n';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

const presetColors = [
  '#ffffff',
  '#000000',
  '#ac725e',
  '#d06b64',
  '#f83a22',
  '#fa573c',
  '#ff7537',
  '#ffad46',
  '#42d692',
  '#008000',
  '#7bd148',
  '#fad165',
  '#FFCC24',
  '#92e1c0',
  '#9fe1e7',
  '#9fc6e7',
  '#4986e7',
  '#9a9cff',
  '#b99aff',
  '#c2c2c2',
  '#cabdbf',
  '#cca6ac',
  '#f691b2',
  '#cd74e6',
  '#a47ae2'
];

interface Props {
  classes: any;
  open: boolean;
  color: string;
  setColor: (color: string) => void;
  presetColors?: Array<string>;
  onClose: () => void;
}

const styles = {
  noBorder: {
    padding: '0 !important',
    boxShadow: 'none !important',
    backgroundColor: 'transparent !important'
  }
};

const ColorPickerDialog = (props: Props) => {
  const [color, setColor] = useState(undefined);
  const [colorHex, setColorHex] = useState(undefined);
  const { open = false, onClose } = props;

  function onConfirm() {
    if (color && colorHex) {
      const hexAlphaColor = colorHex + Math.round(color.a * 255).toString(16);
      props.setColor(hexAlphaColor);
    }
    props.onClose();
  }

  function handleChangeComplete(newColor: any) {
    setColor(newColor.rgb);
    setColorHex(newColor.hex);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle data-tid="colorPickerDialogTitle">
        {i18n.t('core:colorPickerDialogTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent
        data-tid="colorPickerDialogContent"
        style={{
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <SketchPicker
          className={props.classes.noBorder}
          name="color"
          presetColors={props.presetColors ? props.presetColors : presetColors}
          color={color || props.color}
          onChangeComplete={handleChangeComplete}
        />
      </DialogContent>
      <DialogActions>
        <Button data-tid="colorPickerCloseDialog" onClick={props.onClose}>
          {i18n.t('core:cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          data-tid="colorPickerConfirm"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles)(ColorPickerDialog);
