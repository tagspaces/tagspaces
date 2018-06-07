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
 * @flow
 */

import React from 'react';
import Button from 'material-ui/Button';
import {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import { SketchPicker } from 'react-color';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';

const presetColors = ['#ffffff', '#000000', '#ac725e', '#d06b64', '#f83a22', '#fa573c',
  '#ff7537', '#ffad46', '#42d692', '#008000', '#7bd148', '#fad165', '#FFCC24',
  '#92e1c0', '#9fe1e7', '#9fc6e7', '#4986e7', '#9a9cff', '#b99aff', '#c2c2c2',
  '#cabdbf', '#cca6ac', '#f691b2', '#cd74e6', '#a47ae2'];

type Props = {
  open: boolean,
  color: string,
  setColor: (color: string) => void,
  onClose: () => void
};

type State = {
  color: string
};

const styles = {
  noBorder: {
    padding: '0 !important',
    boxShadow: 'none !important'
  }
};

class ColorPickerDialog extends React.Component<Props, State> {
  state = {
    color: ''
  };

  componentWillReceiveProps = (nextProps: any) => {
    if (this.props.color !== nextProps.color) {
      this.setState({
        color: nextProps.color
      });
    }
  };

  onConfirm = () => {
    if (this.state.color && this.state.color.length > 2) {
      this.props.setColor(this.state.color);
    }
    this.props.onClose();
  };

  handleChangeComplete = (color) => {
    this.setState({ color: color.hex });
  };

  renderTitle = () => (
    <DialogTitle>{i18n.t('core:colorPickerDialogTitle')}</DialogTitle>
  );

  renderContent = () => (
    <DialogContent
      style={{
        marginLeft: 'auto',
        marginRight: 'auto'
      }}
    >
      <SketchPicker
        className={this.props.classes.noBorder}
        name="color"
        presetColors={presetColors}
        color={this.state.color}
        onChangeComplete={this.handleChangeComplete}
      />
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="colorPickerCloseDialog"
        onClick={this.props.onClose}
      >
        {i18n.t('core:cancel')}
      </Button>
      <Button
        onClick={this.onConfirm}
        data-tid="colorPickerConfirm"
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withStyles(styles)(ColorPickerDialog);
