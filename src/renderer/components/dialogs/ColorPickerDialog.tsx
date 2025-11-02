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

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { useTranslation } from 'react-i18next';

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
  '#a47ae2',
];

interface Props {
  open: boolean;
  color: string;
  setColor: (color: string) => void;
  presetColors?: Array<string>;
  onClose: () => void;
}

function ColorPickerDialog(props: Props) {
  const { t } = useTranslation();
  const [color, setColor] = useState(undefined);
  const { open = false, onClose } = props;
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  function onConfirm() {
    // if (color && colorHex) {
    //  const hexAlphaColor = colorHex + Math.round(color.a * 255).toString(16);
    props.setColor(color);
    //}
    props.onClose();
  }

  const okButton = (
    <TsButton
      variant="contained"
      onClick={onConfirm}
      data-tid="colorPickerConfirm"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:colorPickerDialogTitle')}
        closeButtonTestId="closeColorPickerTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent
        data-tid="colorPickerDialogContent"
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          overflowX: 'hidden',
        }}
      >
        <ColorPicker
          value={color || props.color}
          onChange={(newColor) => setColor(newColor)}
          presets={props.presetColors ? props.presetColors : presetColors}
          hideEyeDrop
          disableDarkMode
          hideControls
          // @ts-ignore
          style={{ backgroundColor: 'transparent' }}
        />
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="colorPickerCloseDialog" onClick={props.onClose}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default ColorPickerDialog;
