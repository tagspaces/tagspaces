/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import { ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HtmlIcon from '@mui/icons-material/Html';
import RttIcon from '@mui/icons-material/Rtt';

interface DescriptionMenuProps {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  saveAsHtml: () => void;
  saveAsMarkdown: () => void;
}

function DescriptionMenu(props: DescriptionMenuProps) {
  const { t } = useTranslation();
  const { anchorEl, handleClose, saveAsHtml, saveAsMarkdown } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      id="description-menu"
      open={Boolean(anchorEl)}
      onClose={handleClose}
      onClick={handleClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={saveAsHtml}>
        <ListItemIcon>
          <HtmlIcon fontSize="small" />
        </ListItemIcon>
        {t('core:saveAsHtml')}
      </MenuItem>
      <MenuItem onClick={saveAsMarkdown}>
        <ListItemIcon>
          <RttIcon fontSize="small" />
        </ListItemIcon>
        {t('core:saveAsMd')}
      </MenuItem>
    </Menu>
  );
}

export default DescriptionMenu;
