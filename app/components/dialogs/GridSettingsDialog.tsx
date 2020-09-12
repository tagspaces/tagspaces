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

import React from 'react';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import { actions as AppActions } from '-/reducers/app';
import { bindActionCreators } from 'redux';

interface Props {
  open: boolean;
  fullScreen: boolean;
  gridPageLimit: number;
  onClose: () => void;
  setGridPageLimit: (number) => void;
}

const GridSettingsDialog = (props: Props) => {
  const { open, onClose, fullScreen, gridPageLimit } = props;

  const handleGridPaginationLimit = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'limit') {
      props.setGridPageLimit(roughScale(value));
    }
  };

  function roughScale(x) {
    const parsed = parseInt(x, 10);
    if (isNaN(parsed)) {
      return 100;
    }
    return parsed;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
    >
      <DialogTitle>{i18n.t('core:GridSettingsTitle')}</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth={true}
          /*error={this.state.inputError}*/
          style={{ overflow: 'visible' }}
        >
          <TextField
            /* error={this.state.inputError}*/
            margin="dense"
            name="limit"
            autoFocus
            label={i18n.t('core:setGridPageLimit')}
            onChange={handleGridPaginationLimit}
            value={gridPageLimit}
            data-tid="editGridPaginationLimit"
            fullWidth={true}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        {/*<Button
          data-tid="cancelDialog"
          title={i18n.t('core:cancel')}
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>*/}

        <Button
          data-tid="closeGridSettingsDialog"
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setGridPageLimit: AppActions.setGridPageLimit
    },
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    gridPageLimit: state.app.gridPageLimit
  };
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withMobileDialog()(GridSettingsDialog));
