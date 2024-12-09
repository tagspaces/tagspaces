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

import React, { useEffect, useReducer, useRef } from 'react';
import AppConfig from '-/AppConfig';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Box } from '@mui/material';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useSelector } from 'react-redux';
import { getEntryContainerTab } from '-/reducers/settings';
import { useEntryPropsTabsContext } from '-/hooks/useEntryPropsTabsContext';
import { TS } from '-/tagspaces.namespace';

interface Props {}

function LinksTab(props: Props) {
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { isTabOpened } = useEntryPropsTabsContext();
  const selectedTabIndex = useSelector(getEntryContainerTab);
  const links = useRef<TS.Link[]>([]);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const location = findLocation(openedEntry.locationID);

  useEffect(() => {
    isTabOpened(TabNames.linksTab, openedEntry, selectedTabIndex).then(
      (linksTabOpened) => {
        if (linksTabOpened) {
          location
            .checkFileEncryptedPromise(openedEntry.path)
            .then((encrypted) => {
              location
                .getPropertiesPromise(
                  openedEntry.path,
                  encrypted,
                  location.fullTextIndex,
                )
                .then((entryProps: TS.FileSystemEntry) => {
                  if (entryProps.links && entryProps.links.length > 0) {
                    links.current = entryProps.links;
                    forceUpdate();
                  }
                });
            });
        }
      },
    );
  }, [openedEntry, selectedTabIndex]);

  if (!location.fullTextIndex) {
    return (
      <Box position="relative" display="inline-flex">
        TODO: Enable fullTextIndex to extract Links...
      </Box>
    );
  }
  return (
    <Box position="relative" display="inline-flex">
      {links.current.length > 0 && (
        <>
          Document links:
          {links.current.map((link) => (
            <span style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
              {link.type}{' '}
              <a href={link.href} target="_blank">
                {link.value ? link.value : link.href}
              </a>
            </span>
          ))}
        </>
      )}
    </Box>
  );
}

export default LinksTab;
