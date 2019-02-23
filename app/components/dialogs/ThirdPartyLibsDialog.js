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
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import ThirdPartyLibs from '../../third-party.txt';

type Props = {
  open: boolean,
  onClose: () => void
};

const ThirdPartyLibsDialog = (props: Props) => {
  function renderTitle() {
    return (<DialogTitle>{i18n.t('core:thirdPartyLibs')}</DialogTitle>);
  }

  function renderContent() {
    return (
      <DialogContent style={{ overflowX: 'auto' }}>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{ ThirdPartyLibs }</pre>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="confirmThirdPartyLibsDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default withMobileDialog()(ThirdPartyLibsDialog);
