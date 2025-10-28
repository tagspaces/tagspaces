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

import DateIcon from '@mui/icons-material/DateRange';
import PlaceIcon from '@mui/icons-material/Place';
import { Box } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Tag from '-/components/Tag';
import TagContainerMenu from '-/components/TagContainerMenu';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { getTagColors } from '-/services/taglibrary-utils';
import { TS } from '-/tagspaces.namespace';
import { convertToTimestamp, isDateTimeTag } from '-/utils/dates';
import { isGeoTag } from '-/utils/geo';
import { formatDateTime } from '@tagspaces/tagspaces-common/misc';

interface Props {
  tag: TS.Tag;
  tagGroup?: TS.TagGroup;
  handleTagMenu?: (
    event: Object,
    tag: TS.Tag,
    tagGroup: TS.TagGroup | TS.FileSystemEntry,
    haveSelectedEntries: boolean,
  ) => void;
  handleRemoveTag?: (event: Object, tags: Array<TS.Tag>) => void;
  isDragging?: boolean;
  tagMode?: 'default' | 'display' | 'remove';
  entry?: TS.FileSystemEntry;
  deleteIcon?: any;
  moveTag?: (
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid,
  ) => void;
  reorderTags?: boolean;
}

function TagContainer({
  tag,
  tagGroup,
  entry,
  handleTagMenu,
  handleRemoveTag,
  deleteIcon,
  isDragging,
  tagMode,
}: Props) {
  const {
    title: originalTitle,
    functionality,
    color,
    textcolor,
    description,
  } = tag;
  const { addTags } = useTaggingActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { tagGroups } = useEditedTagLibraryContext();

  const defaultBgColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);

  // Compute tag color once
  const { color: bgColor, textcolor: txtColor } = useMemo(
    () =>
      color && textcolor
        ? { color, textcolor }
        : getTagColors(
            originalTitle,
            tagGroup ? [tagGroup] : tagGroups,
            defaultTextColor,
            defaultBgColor,
          ),
    [
      color,
      textcolor,
      originalTitle,
      tagGroup,
      tagGroups,
      defaultTextColor,
      defaultBgColor,
    ],
  );

  // Create the getColor function once
  // const getColors = useCallback(
  //   () =>
  //     color && textcolor
  //       ? { color, textcolor }
  //       : getTagColors(
  //           originalTitle,
  //           tagGroup ? [tagGroup] : tagGroups,
  //           defaultTextColor,
  //           defaultBgColor,
  //         ),
  //   [
  //     color,
  //     textcolor,
  //     originalTitle,
  //     tagGroup,
  //     tagGroups,
  //     defaultTextColor,
  //     defaultBgColor,
  //   ],
  // );
  // const { color: bgColor, textcolor: txtColor } = getColors();

  // let txtColor;
  // let bgColor;
  // if (tag.color && tag.textcolor) {
  //   txtColor = tag.textcolor;
  //   bgColor = tag.color;
  // } else {
  //   const tagColors = getTagColors(
  //     originalTitle,
  //     tagGroup ? [tagGroup] : undefined,
  //     defaultTextColor,
  //     defaultBgColor,
  //   );
  //   txtColor = tagColors.textcolor;
  //   bgColor = tagColors.color;
  // }

  /** Detect tag type */
  const isTagGeo = useMemo(
    () => !tagGroup && isGeoTag(originalTitle),
    [originalTitle, tagGroup],
  );
  const isTagDate = useMemo(
    () => !isTagGeo && !tagGroup && isDateTimeTag(originalTitle),
    [isTagGeo, originalTitle, tagGroup],
  );

  const isGeoSmartTag = functionality === 'geoTagging';
  const isDateSmartTag = [
    'now',
    'today',
    'tomorrow',
    'yesterday',
    'currentMonth',
    'currentYear',
    'dateTagging',
  ].includes(functionality || '');

  /** Compute readable tag title for date tags */
  const tagTitle = useMemo(() => {
    if (!isTagDate) return description ? `${originalTitle} ${description}` : '';
    const [first, second] = originalTitle.split('-');
    const format = (val: string) => {
      const ts = convertToTimestamp(val);
      return formatDateTime(ts, val.length > 8);
    };

    let titleText = '';
    if (second && !isNaN(+first) && !isNaN(+second)) {
      titleText = `${format(first)} <-> ${format(second)}`;
    } else {
      titleText = format(originalTitle);
    }

    return description ? `${titleText} ${description}` : titleText;
  }, [isTagDate, originalTitle, description]);

  /** Truncate long date titles for display */
  const displayTitle = useMemo(
    () =>
      isTagDate && originalTitle.length > 8
        ? `${originalTitle.slice(0, 8)}...`
        : originalTitle,
    [isTagDate, originalTitle],
  );

  const tid = useMemo(
    () => `tagContainer_${originalTitle.replace(/\s+/g, '_')}`,
    [originalTitle],
  );

  /** Unified menu handler */
  const handleMenu = useCallback(
    (event: any) => {
      if (!handleTagMenu) return;
      handleTagMenu(event, tag, entry || tagGroup, !!selectedEntries?.length);
    },
    [handleTagMenu, tag, entry, tagGroup, selectedEntries],
  );

  /** Ctrl+Click adds tag */
  const handleClick = useCallback(
    (event: any) => {
      if (event.ctrlKey && addTags) {
        addTags(selectedEntries, [tag]);
      } else {
        handleMenu(event);
      }
    },
    [addTags, selectedEntries, tag, handleMenu],
  );

  return (
    <Box
      role="presentation"
      data-tid={tid}
      key={tag.id || (tagGroup?.uuid ?? '') + tid}
      onClick={handleClick}
      onContextMenu={handleMenu}
      onDoubleClick={handleMenu}
      sx={{ display: 'inline-block' }}
    >
      <Tag
        isDragging={isDragging}
        tagTitle={tagTitle}
        textColor={txtColor}
        backgroundColor={bgColor}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {(isTagGeo || isGeoSmartTag) && (
            <PlaceIcon sx={{ color: txtColor, height: 16, ml: '-5px' }} />
          )}
          {(isTagDate || isDateSmartTag) && (
            <DateIcon sx={{ color: txtColor, height: 16, ml: '-5px' }} />
          )}
          {!isTagGeo && <span>{displayTitle}</span>}
        </Box>

        <TagContainerMenu
          handleRemoveTag={handleRemoveTag}
          tag={tag}
          tagMode={tagMode}
          deleteIcon={deleteIcon}
        />
      </Tag>
    </Box>
  );
}

export default React.memo(TagContainer);
