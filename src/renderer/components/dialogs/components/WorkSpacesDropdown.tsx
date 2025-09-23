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
import React, { useEffect, useRef } from 'react';
import TsSelect from '-/components/TsSelect';
import TsIconButton from '-/components/TsIconButton';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import { RemoveIcon } from '-/components/CommonIcons';
import { TS } from '-/tagspaces.namespace';

interface WorkSpacesDropdownProps {
  workSpaceId: string | undefined;
  setWorkSpaceId: (id: string) => void;
  workSpaces: TS.WorkSpace[];
  disabled?: boolean;
  dataTid?: string; // will be passed as data-tid on the underlying TsSelect
  label?: React.ReactNode;
  onOpenNewWorkspace?: () => void;
}

const WorkSpacesDropdown: React.FC<WorkSpacesDropdownProps> = ({
  workSpaceId,
  setWorkSpaceId,
  workSpaces,
  disabled = false,
  dataTid = 'taggroupWorkspaceTID',
  label,
  onOpenNewWorkspace,
}) => {
  // Keep track of initial workSpaces to detect additions (keeps original behavior from EditTagGroupDialog)
  const initWorkSpaces = useRef<TS.WorkSpace[]>(workSpaces);

  useEffect(() => {
    // handle new workSpace add
    if (JSON.stringify(workSpaces) !== JSON.stringify(initWorkSpaces.current)) {
      const oldIds = new Set(initWorkSpaces.current.map((item) => item.uuid));
      const addedItems: TS.WorkSpace[] = workSpaces.filter(
        (item) => !oldIds.has(item.uuid),
      );
      if (addedItems && addedItems.length === 1) {
        // when a single workspace was added, select it
        setWorkSpaceId(addedItems[0].uuid);
      }
      initWorkSpaces.current = workSpaces;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workSpaces]);

  return (
    <TsSelect
      disabled={disabled}
      data-tid={dataTid}
      value={workSpaceId}
      fullWidth
      label={label}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        setWorkSpaceId(event.target.value)
      }
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ ml: -2 }}>
              <TsIconButton
                aria-label="add-wspace"
                onClick={() => onOpenNewWorkspace && onOpenNewWorkspace()}
                data-tid="wSpaceAddTID"
              >
                <AddIcon />
              </TsIconButton>
            </InputAdornment>
          ),
          endAdornment: workSpaceId && (
            <InputAdornment position="end">
              <TsIconButton
                aria-label="delete-wspace"
                onClick={() => setWorkSpaceId('')}
                data-tid="wSpaceResetTID"
              >
                <RemoveIcon />
              </TsIconButton>
            </InputAdornment>
          ),
        },
      }}
    >
      {workSpaces.map((wSpace) => (
        <MenuItem
          key={wSpace.uuid}
          value={wSpace.uuid}
          data-tid={'wSpace' + wSpace.shortName + 'TID'}
        >
          {wSpace.shortName + ' - ' + wSpace.fullName}
        </MenuItem>
      ))}
    </TsSelect>
  );
};

export default WorkSpacesDropdown;
