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
import { AddIcon, RemoveIcon } from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import { TS } from '-/tagspaces.namespace';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
            <InputAdornment position="start">
              <TsIconButton
                style={{ marginLeft: -10 }}
                aria-label="add-workspace"
                onClick={() => onOpenNewWorkspace && onOpenNewWorkspace()}
                data-tid="wSpaceAddTID"
                tooltip={t('createWorkspace')}
                disabled={disabled}
              >
                <AddIcon />
              </TsIconButton>
            </InputAdornment>
          ),
          endAdornment: workSpaceId && (
            <InputAdornment position="end">
              <TsIconButton
                aria-label="delete-workspace"
                onClick={() => setWorkSpaceId('')}
                data-tid="wSpaceResetTID"
                style={{ marginRight: 15 }}
                tooltip={t('removeWorkspace')}
                disabled={disabled}
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
