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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import i18n from '../../services/i18n';

function Transition(props) {
  return <Slide direction="down" {...props} />;
}

type Props = {
  open?: boolean,
  fullScreen?: boolean,
  onClose: () => void,
  onBackdropClick?: () => void,
  onEnterKey?: () => void,
  renderTitle?: () => Object,
  renderContent: () => Object,
  renderActions?: () => Object
};

export function onEnterKeyHandler(event: any, confirmFunction: () => void) {
  if (event.key === 'Enter' || event.keyCode === 13) {
    confirmFunction();
  }
}

const GenericDialog = (props: Props) => {
  // function renderTitle() {
  //   return (
  //     <DialogTitle>Dialog</DialogTitle>
  //   );
  // }

  // function renderContent() {
  //   return (
  //     <DialogContent>
  //       <DialogContentText>
  //         Some content
  //       </DialogContentText>
  //     </DialogContent>
  //   );
  // }

  // function renderActions() {
  //   return (
  //     <DialogActions>
  //       <Button onClick={props.onClose} color="primary">
  //         {i18n.t('core:cancel')}
  //       </Button>
  //     </DialogActions>
  //   );
  // }

  const {
    fullScreen,
    open,
    onEnterKey,
    onClose,
    onBackdropClick
  } = props;
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      onBackdropClick={onBackdropClick && onClose}
      // onEscapeKeyDown={onClose}
      onKeyDown={onEnterKey || ((event) => onEnterKeyHandler(event, props.onClose))}
    >
      {props.renderTitle && props.renderTitle()}
      {props.renderContent && props.renderContent()}
      {props.renderActions && props.renderActions()}
    </Dialog>
  );
};

export default GenericDialog;
