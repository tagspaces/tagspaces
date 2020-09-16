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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  withMobileDialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText
} from '@material-ui/core';
import i18n from '-/services/i18n';

interface Props {
  open: boolean;
  fullScreen: boolean;
  gridPageLimit: number;
  onClose: () => void;
  setGridPageLimit: (number) => void;
}

const GridSettingsDialog = (props: Props) => {
  const { open, onClose, fullScreen, gridPageLimit } = props;
  let newGridPageLimit = gridPageLimit;

  const handleGridPaginationLimit = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'limit') {
      // props.setGridPageLimit(roughScale(value));
      newGridPageLimit = roughScale(value);
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
      <DialogTitle>{i18n.t('core:gridSettingsTitle')}</DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth={true}
          /* error={this.state.inputError} */
          style={{ overflow: 'visible' }}
        >
          <InputLabel shrink htmlFor="pageLimit">
            Page Limit
          </InputLabel>
          <Select
            name="limit"
            defaultValue={gridPageLimit}
            onChange={handleGridPaginationLimit}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
            <MenuItem value={undefined}>Unlimited</MenuItem>
          </Select>
          <FormHelperText>Set number of files per page</FormHelperText>
          {/* <TextField
            margin="dense"
            name="limit"
            autoFocus
            label={i18n.t('core:setGridPageLimit')}
            onChange={handleGridPaginationLimit}
            defaultValue={gridPageLimit}
            data-tid="editGridPaginationLimit"
            fullWidth={true}
          /> */}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          data-tid="cancelDialog"
          title={i18n.t('core:cancel')}
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>

        <Button
          data-tid="closeGridSettingsDialog"
          onClick={() => props.setGridPageLimit(newGridPageLimit)}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setGridPageLimit: AppActions.setGridPageLimit
    },
    dispatch
  );
} */

/* function mapStateToProps(state) {
  return {
    gridPageLimit: state.app.gridPageLimit
  };
} */

export default withMobileDialog()(GridSettingsDialog);
