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
import Tooltip from '@material-ui/core/Tooltip';
import { TS } from '-/tagspaces.namespace';
import i18n from '-/services/i18n';

interface Props {
  tags: Array<TS.Tag>;
  defaultTagColor?: string;
}

const TagsPreview = (props: Props) => {
  const { tags, defaultTagColor } = props;
  if (!tags || tags.length < 1) {
    return <></>;
  }
  let tagNames = i18n.t('core:searchTags') + ': ';
  tags.forEach(tag => {
    tagNames = tagNames + tag.title + ' ';
  });
  const firstTagColor = tags[0].color || defaultTagColor;
  let secondTagColor = defaultTagColor;
  let moreThanOne = false;
  if (tags[1]) {
    moreThanOne = true;
    if (tags[1].color) {
      secondTagColor = tags[1].color;
    }
  }
  return (
    <Tooltip title={tagNames}>
      <span
        style={{
          display: 'inline-block',
          width: 15,
          height: 15,
          marginLeft: 5,
          borderRadius: 7,
          borderRight: moreThanOne ? 'white 1px solid' : 'initial',
          boxShadow: moreThanOne ? '4px 0px 0px 0px ' + secondTagColor : 'none',
          backgroundColor: firstTagColor,
          fontSize: 11,
          color: 'white',
          textAlign: 'center'
        }}
      >
        {moreThanOne ? tags.length : '1'}
      </span>
    </Tooltip>
  );
};
export default TagsPreview;
