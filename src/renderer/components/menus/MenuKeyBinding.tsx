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
import Typography from '@mui/material/Typography';
import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';

interface Props {
  keyBinding?: string;
}

function MenuKeyBinding(props: Props) {
  let keyBinding = props.keyBinding;
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      style={{ textTransform: 'uppercase' }}
    >
      {adjustKeyBinding(keyBinding)}
    </Typography>
  );
}

export default MenuKeyBinding;
