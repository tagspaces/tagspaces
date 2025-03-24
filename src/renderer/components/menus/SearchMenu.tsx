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

import {
  ExportIcon,
  HelpIcon,
  ImportIcon,
  CreateFileIcon,
} from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import TsMenuList from '-/components/TsMenuList';
import { Pro } from '-/pro';
import { openURLExternally } from '-/services/utils-io';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  importSearches: () => void;
  exportSearches: () => void;
}

function SearchMenu(props: Props) {
  const { t } = useTranslation();
  const { openSaveSearchDialog } = useSearchQueryContext();
  const menuItems = [];
  menuItems.push(
    <MenuItem
      key="openSavedSearch"
      data-tid="openSavedSearchTID"
      onClick={() => {
        props.onClose();
        openSaveSearchDialog();
      }}
    >
      <ListItemIcon>
        <CreateFileIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:createNewSavedSearchTitle')} />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="exportSavedSearchTID"
      data-tid="exportSavedSearchTID"
      onClick={() => {
        props.onClose();
        props.exportSearches();
      }}
    >
      <ListItemIcon>
        <ExportIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {t('core:exportSavedSearch')}
            <ProLabel />
          </>
        }
      />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="importSavedSearchTID"
      data-tid="importSavedSearchTID"
      onClick={() => {
        props.onClose();
        props.importSearches();
      }}
    >
      <ListItemIcon>
        <ImportIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {t('core:importSavedSearch')}
            <ProLabel />
          </>
        }
      />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      key="searchMenuHelp"
      data-tid="searchMenuHelp"
      onClick={() => {
        props.onClose();
        openURLExternally(Links.documentationLinks.search, true);
      }}
    >
      <ListItemIcon>
        <HelpIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:help')} />
    </MenuItem>,
  );

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        <TsMenuList>{menuItems}</TsMenuList>
      </Menu>
    </div>
  );
}

export default SearchMenu;
