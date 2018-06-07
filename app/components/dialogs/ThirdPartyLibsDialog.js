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
  DialogTitle,
  withMobileDialog
} from 'material-ui/Dialog';
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import { loadFileContentPromise } from '../../services/utils-io';

const thirdpartylibsUrl = './third-party.txt';

type Props = {
  open: boolean,
  onClose: () => void
};

type State = {
  thirdpartylibs?: string
};

class ThirdPartyLibsDialog extends React.Component<Props, State> {
  state = {
    thirdpartylibs: 'Loading content ...'
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      loadFileContentPromise(thirdpartylibsUrl, 'text').then(
        (result) => {
          this.setState({
            thirdpartylibs: result
          });
          return true;
        }
      ).catch((err) => {
        console.log('Error loading third party libs file ' + err);
      });
    }
  }

  renderTitle = () => <DialogTitle>{i18n.t('core:thirdPartyLibs')}</DialogTitle>;

  renderContent = () => (
    <DialogContent style={{ overflowY: 'overlay', overflowX: 'auto' }}>
      <pre>{ this.state.thirdpartylibs }</pre>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      <Button
        data-tid="confirmThirdPartyLibsDialog"
        onClick={this.props.onClose}
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
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(ThirdPartyLibsDialog);
