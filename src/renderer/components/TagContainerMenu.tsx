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
import { useSelector } from 'react-redux';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveTagIcon from '@mui/icons-material/Close';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  tag: TS.Tag;
  tagMode: 'default' | 'display' | 'remove';
  deleteIcon?: any;
  handleRemoveTag: (event: any, tags: Array<TS.Tag>) => void;
}

function TagContainerMenu(props: Props) {
  const { readOnlyMode } = useCurrentLocationContext();
  const { deleteIcon, tag, handleRemoveTag, tagMode } = props;
  if (readOnlyMode) {
    return <div style={{ width: 10 }} />;
  }
  if (tagMode === 'display') {
    return <div style={{ width: 10 }} />;
  }
  return tagMode === 'remove' ? (
    deleteIcon || (
      <RemoveTagIcon
        data-tid={'tagRemoveButton_' + tag.title.replace(/ /g, '_')}
        style={{
          color: tag.textcolor,
          fontSize: 20,
        }}
        onClick={(event) =>
          handleRemoveTag ? handleRemoveTag(event, [tag]) : false
        }
      />
    )
  ) : (
    <MoreVertIcon
      data-tid={'tagMoreButton_' + tag.title.replace(/ /g, '_')}
      style={{
        color: tag.textcolor,
        marginLeft: -5,
        marginRight: -5,
        height: 20,
      }}
    />
  );
}

export default TagContainerMenu;
