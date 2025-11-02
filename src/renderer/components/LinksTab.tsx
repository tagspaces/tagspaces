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

import AppConfig from '-/AppConfig';
import { LinkIcon, ReloadIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getEntryContainerTab } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { extractLinks } from '@tagspaces/tagspaces-common/misc';
import {
  cleanRootPath,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TooltipTS from './Tooltip';

interface Props {}

function LinksTab(props: Props) {
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry, openLink } = useOpenedEntryContext();
  const { findLinks, checkIndexExist, isIndexing, createLocationIndex } =
    useLocationIndexContext();
  const selectedTabName = useSelector(getEntryContainerTab);
  const links = useRef<TS.Link[]>([]);
  const inboundLinks = useRef<TS.FileSystemEntry[]>([]);
  const indexExist = useRef<boolean>(false);
  const theme = useTheme();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const location = findLocation(openedEntry.locationID);

  useEffect(() => {
    if (selectedTabName === TabNames.linksTab) {
      links.current = [];
      inboundLinks.current = [];
      indexExist.current = false;
      // links from description
      if (openedEntry.meta?.description) {
        const descriptionLinks = extractLinks(openedEntry.meta?.description);
        if (descriptionLinks && descriptionLinks.length > 0) {
          links.current = descriptionLinks;
        }
      }
      forceUpdate();

      // links from file content
      location.checkFileEncryptedPromise(openedEntry.path).then((encrypted) => {
        location
          .getPropertiesPromise(openedEntry.path, encrypted, true)
          .then((entryProps: TS.FileSystemEntry) => {
            if (entryProps.links && entryProps.links.length > 0) {
              links.current = [...links.current, ...entryProps.links];
              forceUpdate();
            }
          });
      });

      // external (inbound) links
      checkIndexExist(location.uuid).then((exist) => {
        indexExist.current = exist;
        if (exist) {
          setInboundLinks();
        }
      });
    }
  }, [openedEntry, selectedTabName]);

  function refreshInboundLinks() {
    createLocationIndex(location).then(() => setInboundLinks());
  }

  function setInboundLinks() {
    const entryID = openedEntry.uuid;
    findLinks(entryID, location.uuid).then((entries) => {
      inboundLinks.current = entries;
      indexExist.current = true;
      forceUpdate();
    });
  }

  const outgoingLinkButton = (link: TS.Link) => {
    let url = link.value ? link.value : link.href;
    url = url.split('\\').join(''); // tmp fix for milkdown issue
    let buttonTitle = '';
    if (link.type === 'url') {
      try {
        buttonTitle = new URL(url).hostname;
      } catch (e) {
        console.log('Error parsing URL: ' + e);
      }
    } else if (link.type === 'tslink') {
      // file ts://?tslid=dd484720e24d429083d81a5379909798&tsepath=contacts%2Fcontacts-gmail.vcf&tseid=acfa652ede334c9490e6d2672ffdc742
      // folder ts://?tslid=dd484720e24d429083d81a5379909798&tsdpath=DeutscheTelecom&tseid=0bae06de993c4fd0a034fb4ab9484992
      const tsUrl = new URL(url);
      const locationId = tsUrl.searchParams.get('tslid');
      const folderPath = tsUrl.searchParams.get('tsdpath');
      const entryPath = tsUrl.searchParams.get('tsepath');
      const locationName = findLocation(locationId)?.name;
      if (locationName) {
        buttonTitle = locationName + ' ⇒ ';
      }
      if (folderPath) {
        buttonTitle += folderPath;
      } else if (entryPath) {
        buttonTitle += entryPath;
      }
    }
    return (
      <>
        <TsButton
          data-tid={'linkTID' + url}
          tooltip={url}
          onClick={() => openLink(url)}
          variant="text"
          startIcon={
            <TooltipTS title={link.type}>
              <LinkIcon />
            </TooltipTS>
          }
          sx={{
            marginRight: AppConfig.defaultSpaceBetweenButtons,
            textTransform: 'none',
            fontWeight: 'normal',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {buttonTitle}
        </TsButton>
        <br />
      </>
    );
  };

  const incomingLinkButton = (fsEntry: TS.FileSystemEntry) => {
    let buttonTitle = fsEntry.name;
    const entryLocation = findLocation(fsEntry.locationID);
    const relativeEntryPath = cleanRootPath(
      fsEntry.path,
      entryLocation.path,
      entryLocation.getDirSeparator(),
    );
    const sharingLink = generateSharingLink(
      fsEntry.locationID,
      relativeEntryPath,
      undefined,
      fsEntry.uuid,
    );
    return (
      <>
        <TsButton
          data-tid={'linkTID' + fsEntry.uuid}
          tooltip={sharingLink}
          onClick={() => openLink(sharingLink)}
          variant="text"
          startIcon={
            <TooltipTS title={fsEntry.path}>
              <LinkIcon />
            </TooltipTS>
          }
          sx={{
            marginRight: AppConfig.defaultSpaceBetweenButtons,
            textTransform: 'none',
            fontWeight: 'normal',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {buttonTitle}
        </TsButton>
        <br />
      </>
    );
  };

  return (
    <>
      <Box display="block">
        {links.current && links.current.length > 0 && (
          <>
            <Typography variant="caption">
              {t('core:outgoingLinks')} (
              {t('found in the file content and/or its description')}):
            </Typography>
            <br />
            {links.current?.map((link) => outgoingLinkButton(link))}
          </>
        )}
      </Box>
      <Box display="block">
        <Typography variant="caption">
          {t('core:incomingLinks')} (
          {t('full text search should be enabled for this location')}):
        </Typography>
        <br />
        {inboundLinks.current?.length ? (
          <>
            {inboundLinks.current.map((entry) => {
              return incomingLinkButton(entry);
            })}
          </>
        ) : (
          <>
            <Typography variant="caption">No incoming links found</Typography>
            <br />
          </>
        )}
        <TsButton
          loading={isIndexing !== undefined}
          data-tid={'generateInboundTID'}
          onClick={refreshInboundLinks}
          startIcon={<ReloadIcon />}
        >
          {t('core:generateInbound')}
        </TsButton>
      </Box>
    </>
  );
}

export default LinksTab;
