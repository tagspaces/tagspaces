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

import { actions as AppActions } from '-/reducers/app';
import { AnyAction } from 'redux';
import { AppDispatch } from '-/reducers/app';
import { TS } from '@tagspaces/tagspaces-common/types';

export const selectAllFiles = (files: Array<TS.File>) => (
  dispatch: AppDispatch,
): AnyAction => {
  const selectedFiles = files.map((file) => file.path);
  return dispatch(AppActions.setFileSelection(selectedFiles));
};

export const deselectAllFiles = () => (
  dispatch: AppDispatch,
): AnyAction => {
  return dispatch(AppActions.setFileSelection([]));
};
