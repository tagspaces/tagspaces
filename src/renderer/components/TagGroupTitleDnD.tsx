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
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  ConnectDragSource,
  ConnectDropTarget,
  DragSource,
  DropTarget,
} from 'react-dnd';
import Grid from '@mui/material/Grid';
import { TS } from '-/tagspaces.namespace';
import DragItemTypes from '-/components/DragItemTypes';
import { classes, SidePanel } from '-/components/SidePanels.css';

interface Props {
  index: number;
  tagGroup: TS.TagGroup;
  handleTagGroupMenu: (
    event: React.ChangeEvent<HTMLInputElement>,
    tagGroup: TS.TagGroup,
  ) => void;
  toggleTagGroup: (uuid: string) => void;
  moveTagGroup: (tagGroupUuid: TS.Uuid, position: number) => void;
  locations: Array<TS.Location>;
  tagGroupCollapsed: Array<string>;
  isReadOnly: boolean;
  connectDragSource?: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
}

function TagGroupTitleDnD(props: Props) {
  const handleTagGroupTitleClick = (event: Object, tagGroup) => {
    props.toggleTagGroup(tagGroup.uuid);
  };

  function getLocationName(locationId: string) {
    if (locationId) {
      const location: TS.Location = props.locations.find(
        (l) => l.uuid === locationId,
      );
      if (location) {
        return ' (' + location.name + ')';
      }
    }
    return '';
  }

  const { tagGroup, handleTagGroupMenu, connectDropTarget, connectDragSource } =
    props;

  const tagGroupTitle = (
    <div>
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
              onClick={(event: any) =>
                handleTagGroupTitleClick(event, tagGroup)
              }
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
              onClick={(event: any) =>
                handleTagGroupTitleClick(event, tagGroup)
              }
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
            {!props.isReadOnly && (
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
    </div>
  );
  if (tagGroup.readOnly) {
    return tagGroupTitle;
  }
  return connectDropTarget(connectDragSource(tagGroupTitle));
}

const boxSource = {
  beginDrag(props) {
    return { tagGroup: props.tagGroup, index: props.index };
  } /* ,
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
  } */,
};

/**
 * Specifies which props to inject into your component.
 */
const collectSource = (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDragSource: connect.dragSource(),
  // You can ask the monitor about the current drag preview
  connectDragPreview: connect.dragPreview(),
  // You can ask the monitor about the current drag state:
  isDragging: monitor.isDragging(),
});

const boxTarget = {
  // Expected the drop target specification to only have some of the following keys: canDrop, hover, drop
  /* canDrop(props, monitor) {
    const dragItem = monitor.getItem();
    return dragItem.tag.type === props.tag.type;
  }, */
  hover(props, monitor) {
    const dragItem = monitor.getItem();
    const dragIndex = dragItem.index;
    const hoverIndex = props.index;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveTagGroup(dragItem.tagGroup.uuid, hoverIndex);
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    dragItem.index = hoverIndex;
  },
};
const collectTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default DragSource(
  DragItemTypes.TAG_GROUP,
  boxSource,
  collectSource,
)(
  DropTarget(
    DragItemTypes.TAG_GROUP,
    boxTarget,
    collectTarget,
  )(TagGroupTitleDnD),
);
