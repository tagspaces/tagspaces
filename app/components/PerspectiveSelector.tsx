/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2021-present TagSpaces UG (haftungsbeschraenkt)
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
import Input from '@mui/material/Input';
import ListItemIcon from '@mui/material/ListItemIcon';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { AvailablePerspectives, PerspectiveIDs } from '-/perspectives';
import i18n from '../services/i18n';
import { Pro } from '-/pro';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';

function PerspectiveSelector(props) {
  const { defaultValue, onChange, testId, label } = props;

  const perspectiveSelectorMenuItems = [];
  perspectiveSelectorMenuItems.push(
    <MenuItem
      style={{ display: 'flex' }}
      key={PerspectiveIDs.UNSPECIFIED}
      value={PerspectiveIDs.UNSPECIFIED}
    >
      <div style={{ display: 'flex' }}>
        <ListItemIcon style={{ paddingLeft: 3, paddingTop: 3 }}>
          <LayersClearIcon />
        </ListItemIcon>
        <ListItemText>{i18n.t('core:unspecified')}</ListItemText>
      </div>
    </MenuItem>
  );

  AvailablePerspectives.forEach(perspective => {
    let includePerspective = perspective.beta === false;
    if (!Pro && perspective.pro === true) {
      includePerspective = false;
    }
    if (Pro && perspective.beta === false) {
      includePerspective = true;
    }
    if (includePerspective) {
      perspectiveSelectorMenuItems.push(
        <MenuItem key={perspective.key} value={perspective.id}>
          <div style={{ display: 'flex' }}>
            <ListItemIcon style={{ paddingLeft: 3, paddingTop: 3 }}>
              {perspective.icon}
            </ListItemIcon>
            <ListItemText>{perspective.title}</ListItemText>
          </div>
        </MenuItem>
      );
    }
  });

  return (
    <TextField
      data-tid={testId}
      defaultValue={defaultValue}
      onChange={onChange}
      select
      label={label}
      fullWidth
      // input={<Input id="changePerspectiveId" />}
    >
      {perspectiveSelectorMenuItems}
    </TextField>
  );
}

function mapStateToProps(state) {
  return { language: getCurrentLanguage(state) };
}
export default connect(mapStateToProps)(PerspectiveSelector);
