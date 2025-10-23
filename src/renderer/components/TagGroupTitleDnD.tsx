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

import AppConfig from '-/AppConfig';
import {
  MoreMenuIcon,
  SmallArrowDownIcon,
  SmallArrowRightIcon,
} from '-/components/CommonIcons';
import DragItemTypes from '-/components/DragItemTypes';
import TooltipTS from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useContext, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';

interface Props {
  index: number;
  tagGroup: TS.TagGroup;
  handleTagGroupMenu: (
    event: React.MouseEvent<HTMLElement>,
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
    tagGroupCollapsed,
    isReadOnly,
  } = props;
  const { findLocation } = useCurrentLocationContext();
  const tagGroupRef = useRef<HTMLSpanElement>(null);
  const { t } = useTranslation();
  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  // Determine expanded state from tagGroupCollapsed prop
  const expanded = !(
    tagGroupCollapsed && tagGroupCollapsed.includes(tagGroup.uuid)
  );

  // Drag and drop logic for tag group reordering
  const [, drag] = useDrag({
    type: DragItemTypes.TAG_GROUP,
    item: { tagGroup: tagGroup, index: index },
  });

  const dropHover = (dragItem, monitor) => {
    const dragIndex = dragItem.index;
    const hoverIndex = index;
    if (dragIndex === hoverIndex) {
      return;
    }
    const hoverBoundingRect =
      tagGroupRef && tagGroupRef.current
        ? tagGroupRef.current.getBoundingClientRect()
        : undefined;

    const hoverMiddleY = hoverBoundingRect
      ? (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      : 0;

    const clientOffset = monitor.getClientOffset();
    const hoverClientY =
      clientOffset && hoverBoundingRect
        ? clientOffset.y - hoverBoundingRect.top
        : 0;

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    moveTagGroup(dragItem.tagGroup.uuid, hoverIndex);
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

  const readOnly = tagGroup.readOnly ? 'read-only ' : '';

  const currentWorkspace = workSpacesContext?.getWorkSpace(
    tagGroup.workSpaceId,
  );
  const taggroupWorkspace = tagGroup.workSpaceId ? (
    <TooltipTS title={t('core:workspace') + ': ' + currentWorkspace?.fullName}>
      <span> - {currentWorkspace?.shortName}</span>
    </TooltipTS>
  ) : (
    ''
  );

  const tagGroupTitle = (
    <Box
      data-tid={'tagLibraryTagGroupTitle_' + tagGroup.title}
      sx={{
        padding: 0,
        height: '100%',
        borderRadius: AppConfig.defaultCSSRadius,
      }}
    >
      <Grid
        container
        direction="row"
        alignItems="stretch"
        alignContent="center"
        sx={{ flexWrap: 'nowrap' }}
      >
        <Grid size={2} sx={{ maxWidth: 40 }}>
          <TsIconButton
            sx={{ minWidth: 'auto', padding: '7px' }}
            onClick={(event: any) => handleTagGroupTitleClick(event, tagGroup)}
            size="large"
          >
            {expanded ? <SmallArrowDownIcon /> : <SmallArrowRightIcon />}
          </TsIconButton>
        </Grid>
        <Grid size={9} sx={{ alignSelf: 'center' }}>
          <Typography
            sx={{ paddingLeft: 0 }}
            data-tid="locationTitleElement"
            noWrap
            onClick={(event: any) => handleTagGroupTitleClick(event, tagGroup)}
          >
            <TooltipTS
              title={
                'Number of tags in this ' +
                readOnly +
                'tag group: ' +
                tagGroup.children.length
              }
            >
              {tagGroup.title + getLocationName(tagGroup.locationId)}
            </TooltipTS>
            {taggroupWorkspace}
            {!expanded && (
              <Box
                sx={{
                  display: 'inline-block',
                  minWidth: 10,
                  padding: '3px 7px',
                  fontSize: '10px',
                  fontWeight: 'normal',
                  marginLeft: '4px',
                  color: '#ffffff',
                  lineHeight: 1,
                  verticalAlign: 'middle',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  backgroundColor: '#bbbbbb',
                  borderRadius: '10px',
                }}
              >
                {tagGroup.children.length}
              </Box>
            )}
          </Typography>
        </Grid>
        <Grid size={1} sx={{ textAlign: 'end' }}>
          {!isReadOnly && (
            <TsIconButton
              sx={{ minWidth: 'auto', padding: '7px' }}
              data-tid={
                'tagLibraryMoreButton_' + tagGroup.title.replace(/ /g, '_')
              }
              onClick={(event: any) => handleTagGroupMenu(event, tagGroup)}
            >
              <MoreMenuIcon />
            </TsIconButton>
          )}
        </Grid>
      </Grid>
    </Box>
  );

  if (tagGroup.readOnly) {
    return tagGroupTitle;
  }

  drag(drop(tagGroupRef));

  return <span ref={tagGroupRef}>{tagGroupTitle}</span>;
}

export default TagGroupTitleDnD;
