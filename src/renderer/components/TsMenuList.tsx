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

import { isDesktopMode } from '-/reducers/settings';
import MenuList, { MenuListProps } from '@mui/material/MenuList';
import { useSelector } from 'react-redux';

export type TSButtonProps = MenuListProps & {};

function TsMenuList(props: TSButtonProps) {
  const { children } = props;
  const desktopMode = useSelector(isDesktopMode);

  return (
    <MenuList dense={desktopMode ? true : false} {...props}>
      {children}
    </MenuList>
  );
}

export default TsMenuList;
