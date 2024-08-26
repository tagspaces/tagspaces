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

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import PlaceIcon from '@mui/icons-material/Place';
import DateIcon from '@mui/icons-material/DateRange';
import Tooltip from '-/components/Tooltip';
import { formatDateTime } from '@tagspaces/tagspaces-common/misc';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { isGeoTag } from '-/utils/geo';
import { isDateTimeTag, convertToTimestamp } from '-/utils/dates';
import { TS } from '-/tagspaces.namespace';
import { getTagColors } from '-/services/taglibrary-utils';
import TagContainerMenu from '-/components/TagContainerMenu';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

interface Props {
  tag: TS.Tag;
  tagGroup?: TS.TagGroup;
  handleTagMenu?: (
    event: Object,
    tag: TS.Tag,
    tagGroup: TS.TagGroup | string,
    haveSelectedEntries: boolean,
  ) => void; // TODO refactor
  handleRemoveTag?: (event: Object, tags: Array<TS.Tag>) => void;
  isDragging?: boolean;
  tagMode?: 'default' | 'display' | 'remove';
  entryPath?: string;
  deleteIcon?: any;
  addTags?: (paths: Array<string>, tags: Array<TS.Tag>, updateIndex?) => void;
  moveTag?: (
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid,
  ) => void;
  reorderTags?: boolean;
}

function TagContainer(props: Props) {
  const {
    tag,
    deleteIcon,
    isDragging,
    tagGroup,
    entryPath,
    handleRemoveTag,
    handleTagMenu,
    addTags,
    tagMode,
  } = props;
  let { title } = tag;

  const { selectedEntries } = useSelectedEntriesContext();
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);

  let isDateSmartTag = false;
  let isGeoSmartTag = false;
  let textColor: string;
  let backgroundColor: string;
  const isTagGeo = useMemo(
    () => !tagGroup && isGeoTag(title),
    [title, tagGroup],
  );
  const isTagDate = useMemo(
    () => !isTagGeo && !tagGroup && isDateTimeTag(title),
    [isTagGeo, title, tagGroup],
  );

  const tagColors = getTagColors(
    title,
    tag.textcolor || defaultTextColor,
    tag.color || defaultBackgroundColor,
  );
  textColor = tagColors.textcolor;
  backgroundColor = tagColors.color;

  let tid = 'tagContainer_';
  if (title && title.length > 0) {
    tid += title.replace(/ /g, '_');
  }

  if (tag.functionality && tag.functionality.length > 0) {
    const tagFunc = tag.functionality;
    if (
      tagFunc === 'now' ||
      tagFunc === 'today' ||
      tagFunc === 'tomorrow' ||
      tagFunc === 'yesterday' ||
      tagFunc === 'currentMonth' ||
      tagFunc === 'currentYear' ||
      tagFunc === 'dateTagging'
    ) {
      isDateSmartTag = true;
    } else if (tagFunc === 'geoTagging') {
      isGeoSmartTag = true;
    }
  }

  let tagTitle = ''; // tag.title;
  if (isTagDate) {
    let date;
    if (tag.title.includes('-')) {
      const timeArr = tag.title.split('-');
      if (parseInt(timeArr[0], 10) && parseInt(timeArr[1], 10)) {
        const firstTime = convertToTimestamp(timeArr[0]);
        const secondTime = convertToTimestamp(timeArr[1]);
        const haveTime0 = timeArr[0].length > 8;
        const haveTime1 = timeArr[1].length > 8;
        tagTitle =
          formatDateTime(firstTime, haveTime0) +
          ' <-> ' +
          formatDateTime(secondTime, haveTime1);
      }
    } else if (tag.title.length > 8) {
      date = convertToTimestamp(tag.title); //new Date(convertToDateTime(tag.title)).getTime();
      tagTitle = formatDateTime(date, true);
    } else {
      date = convertToTimestamp(tag.title); //new Date(convertToDate(tag.title)).getTime();
      tagTitle = formatDateTime(date, false);
    }
  }

  if (tag.description) {
    tagTitle = tagTitle + ' ' + tag.description;
  }

  if (isTagDate && title.length > 8) {
    title = title.substring(0, 8) + '...';
  }

  return (
    <div
      role="presentation"
      data-tid={tid}
      key={tag.id || (tagGroup ? tagGroup.uuid : '') + tid} // don't set unique uuidv1() here - menu anchorEl needs to be the same for the same TagContainer key (or TagMenu will be displayed in top left corner)
      onClick={(event) => {
        if (event.ctrlKey && addTags) {
          const selectedEntryPaths = [];
          selectedEntries.map((entry) => selectedEntryPaths.push(entry.path));
          addTags(selectedEntryPaths, [tag]);
          // Removing tags doesn't seem to work correctly here, yet. Using sidecar tagging, but the removeTagsFromEntry function in tagging.actions.js
          // doesn't recignize it correctly, thinking it's a plain tag and thus tries to rename the files
          // } else if (event.shiftKey) {
          //   const selectedEntryPaths = [];
          //   selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
          //   removeTags(selectedEntryPaths, [tag]);
        } else if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0,
          );
        }
      }}
      onContextMenu={(event) => {
        if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0,
          );
        }
      }}
      onDoubleClick={(event) => {
        if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0,
          );
        }
      }}
      style={{
        backgroundColor: 'transparent',
        display: 'inline-block',
      }}
    >
      <Tooltip title={tagTitle}>
        <Button
          size="small"
          style={{
            opacity: isDragging ? 0.5 : 1,
            fontSize: 13,
            fontWeight: 'normal',
            lineHeight: '10px',
            textTransform: 'none',
            textWrap: 'nowrap',
            whiteSpace: 'nowrap',
            color: textColor,
            backgroundColor,
            minHeight: 18,
            minWidth: 0,
            margin: 2,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
            paddingLeft: 5,
            borderRadius: 5,
          }}
        >
          <span
            style={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {(isTagGeo || isGeoSmartTag) && (
              <PlaceIcon
                style={{
                  color: textColor,
                  height: 16,
                  marginLeft: -5,
                }}
              />
            )}
            {(isTagDate || isDateSmartTag) && (
              <DateIcon
                style={{
                  color: textColor,
                  height: 16,
                  marginLeft: -5,
                }}
              />
            )}
            {!isTagGeo && <span>{title}</span>}
          </span>
          <TagContainerMenu
            handleRemoveTag={handleRemoveTag}
            tag={tag}
            tagMode={tagMode}
            deleteIcon={deleteIcon}
          />
        </Button>
      </Tooltip>
    </div>
  );
}

export default React.memo(TagContainer);
