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

import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import Tooltip from '-/components/Tooltip';
import { TS } from '-/tagspaces.namespace';

import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { getTagColors } from '-/services/taglibrary-utils';
import { useTranslation } from 'react-i18next';

interface Props {
  tags: Array<TS.Tag>;
}

function TagsPreview(props: Props) {
  const { t } = useTranslation();
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);

  const { tags } = props;
  // const allTags = useRef<Array<TS.Tag>>(getAllTags(getTagLibrary()));
  if (!tags || tags.length < 1) {
    return <></>;
  }
  let tagNames = t('core:searchTags') + ': ';
  tags.forEach((tag) => {
    tagNames = tagNames + tag.title + ' ';
  });

  let firstTagColor: string;
  let firstTagTextColor: string;
  if (tags[0].color && tags[0].textcolor) {
    firstTagColor = tags[0].color;
    firstTagTextColor = tags[0].textcolor;
  } else {
    const tagColors = getTagColors(
      tags[0].title,
      defaultTextColor,
      defaultBackgroundColor,
    );
    firstTagColor = tagColors.color;
    firstTagTextColor = tagColors.textcolor;
  }

  let secondTagColor = defaultBackgroundColor;
  let moreThanOne = false;
  if (tags[1]) {
    moreThanOne = true;
    if (tags[1].color) {
      secondTagColor = tags[1].color;
    } else {
      const tag2Colors = getTagColors(
        tags[1].title,
        defaultTextColor,
        defaultBackgroundColor,
      );
      secondTagColor = tag2Colors.color;
    }
  }
  return (
    <Tooltip title={tagNames}>
      <span
        style={{
          display: 'inline-block',
          minWidth: 15,
          width: 18,
          height: 15,
          marginLeft: 5,
          borderRadius: 7,
          borderRight: moreThanOne ? 'white 1px solid' : 'initial',
          boxShadow: moreThanOne ? '4px 0px 0px 0px ' + secondTagColor : 'none',
          backgroundColor: firstTagColor,
          fontSize: 11,
          lineHeight: '16px',
          color: firstTagTextColor || defaultTextColor, //tag1Colors.textcolor ,
          textAlign: 'center',
          // @ts-ignore
          WebkitAppRegion: 'no-drag',
        }}
      >
        {moreThanOne ? tags.length : '1'}
      </span>
    </Tooltip>
  );
}
export default TagsPreview;
