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

interface Props {
  isFile: boolean;
}

const EntryIcon = (props: Props) => (
  <svg
    style={{
      // marginTop: 25,
      width: '60%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      height: 150
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="32"
    height="32"
    fill="none"
    stroke="#bbbbbb22"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    {props.isFile ? (
      <path d="M6 2 L6 30 26 30 26 10 18 2 Z M18 2 L18 10 26 10" />
    ) : (
      <path d="M2 26 L30 26 30 7 14 7 10 4 2 4 Z M30 12 L2 12" />
    )}
  </svg>
);
export default EntryIcon;
