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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useDrag, useDrop } from 'react-dnd';
import Grid from '@mui/material/Grid';
import { TS } from '-/tagspaces.namespace';
import DragItemTypes from '-/components/DragItemTypes';
import { classes, SidePanel } from '-/components/SidePanels.css';
import { CommonLocation } from '-/utils/CommonLocation';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  index: number;
  tagGroup: TS.TagGroup;
  handleTagGroupMenu: (
    event: React.ChangeEvent<HTMLInputElement>,
    tagGroup: TS.TagGroup,
  ) => void;
  toggleTagGroup: (uuid: string) => void;
  moveTagGroup: (tagGroupUuid: TS.Uuid, position: number) => void;
  tagGroupCollapsed: Array<string>;
  isReadOnly: boolean;
}

function TagGroupTitleDnD(props: Props) {
  const {
    index,
    tagGroup,
    handleTagGroupMenu,
    moveTagGroup,
    toggleTagGroup,
    isReadOnly,
  } = props;
  const { findLocation } = useCurrentLocationContext();
  const tagGroupRef = useRef<HTMLSpanElement>(null);

  const [, drag] = useDrag({
    type: DragItemTypes.TAG_GROUP,
    item: { tagGroup: tagGroup, index: index },
  });
  const dropHover = (dragItem, monitor) => {
    // const dragItem = monitor.getItem();
    const dragIndex = dragItem.index;
    const hoverIndex = index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    // Determine rectangle on screen
    const hoverBoundingRect =
      tagGroupRef && tagGroupRef.current
        ? tagGroupRef.current.getBoundingClientRect()
        : undefined; // findDOMNode(component).getBoundingClientRect(); // tagContainerRef.current.getBoundingClientRect();

    // Get vertical middle (bottom = right; top = left)
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    moveTagGroup(dragItem.tagGroup.uuid, hoverIndex);
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    dragItem.index = hoverIndex;
  };

  const [, drop] = useDrop({
    accept: DragItemTypes.TAG_GROUP,
    hover: dropHover,
  });

  const handleTagGroupTitleClick = (event: Object, tagGroup) => {
    toggleTagGroup(tagGroup.uuid);
  };

  function getLocationName(locationId: string) {
    if (locationId) {
      const location: CommonLocation = findLocation(locationId);
      if (location) {
        return ' (' + location.name + ')';
      }
    }
    return '';
  }

  const tagGroupTitle = (
    <SidePanel
      data-tid={'tagLibraryTagGroupTitle_' + tagGroup.title}
      className={classes.listItem}
      title={'Number of tags in this tag group: ' + tagGroup.children.length}
    >
      <Grid
        container
        direction="row"
        alignItems="stretch"
        alignContent="center"
        style={{ flexWrap: 'nowrap' }}
      >
        <Grid item xs={2} style={{ maxWidth: 40 }}>
          <IconButton
            style={{ minWidth: 'auto', padding: 7 }}
            onClick={(event: any) => handleTagGroupTitleClick(event, tagGroup)}
            size="large"
          >
            {tagGroup.expanded ? <ArrowDownIcon /> : <ArrowRightIcon />}
          </IconButton>
        </Grid>
        <Grid item xs={8} style={{ alignSelf: 'center' }}>
          <Typography
            variant="inherit"
            className={classes.header}
            style={{ paddingLeft: 0 }}
            data-tid="locationTitleElement"
            noWrap
            onClick={(event: any) => handleTagGroupTitleClick(event, tagGroup)}
          >
            {tagGroup.title + getLocationName(tagGroup.locationId)}
            {!tagGroup.expanded && (
              <span
                style={{
                  display: 'inline-block',
                  minWidth: 10,
                  padding: '3px 7px',
                  fontSize: 10,
                  fontWeight: 'normal',
                  marginLeft: 4,
                  color: '#ffffff',
                  lineHeight: 1,
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  backgroundColor: '#bbbbbb',
                  borderRadius: 10,
                }}
              >
                {tagGroup.children.length}
              </span>
            )}
          </Typography>
        </Grid>
        <Grid item xs={2} style={{ textAlign: 'end' }}>
          {!isReadOnly && (
            <IconButton
              style={{ minWidth: 'auto', padding: 7 }}
              data-tid={
                'tagLibraryMoreButton_' + tagGroup.title.replace(/ /g, '_')
              }
              onClick={(event: any) => handleTagGroupMenu(event, tagGroup)}
              size="large"
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </SidePanel>
  );
  if (tagGroup.readOnly) {
    return tagGroupTitle;
  }

  drag(drop(tagGroupRef));

  return <span ref={tagGroupRef}>{tagGroupTitle}</span>;
}

export default TagGroupTitleDnD;
