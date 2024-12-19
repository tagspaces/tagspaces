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
import { LinkIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getEntryContainerTab } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Box, Typography } from '@mui/material';
import { extractLinks } from '@tagspaces/tagspaces-common/misc';
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TooltipTS from './Tooltip';

interface Props {}

function LinksTab(props: Props) {
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry, sharingLink, openLink } = useOpenedEntryContext();
  const { findLinks, checkIndexExist, isIndexing, createLocationIndex } =
    useLocationIndexContext();
  const selectedTabName = useSelector(getEntryContainerTab);
  const links = useRef<TS.Link[]>([]);
  const inboundLinks = useRef<TS.FileSystemEntry[]>([]);
  const indexExist = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const location = findLocation(openedEntry.locationID);

  useEffect(() => {
    if (selectedTabName === TabNames.linksTab) {
      links.current = [];
      inboundLinks.current = [];
      indexExist.current = false;
      // links from description
      if (openedEntry.meta?.description) {
        const descriptionLinks = extractLinks(openedEntry.meta.description);
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
    findLinks(sharingLink, location.uuid).then((entries) => {
      inboundLinks.current = entries;
      indexExist.current = true;
      forceUpdate();
    });
  }

  const linkButton = (link: TS.Link) => {
    const url = link.value ? link.value : link.href;
    let buttonTitle = url;
    if (link.type === 'url') {
      buttonTitle = new URL(url).hostname;
    } else if (link.type === 'tslink') {
    }
    return (
      <>
        <TsButton
          data-tid={'linkTID' + link.href}
          tooltip={url}
          onClick={() => openLink(link.href)}
          variant="text"
          startIcon={
            <TooltipTS title={link.type}>
              <LinkIcon />
            </TooltipTS>
          }
          style={{
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

  const findInboundButton = (title) => (
    <TsButton
      loading={isIndexing !== undefined}
      data-tid={'generateInboundTID'}
      variant="text"
      onClick={() =>
        title === 'reGenerateInbound'
          ? refreshInboundLinks()
          : setInboundLinks()
      }
      style={{
        marginRight: AppConfig.defaultSpaceBetweenButtons,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {t('core:' + title)}
    </TsButton>
  );

  return (
    <Box display="block">
      {links.current && links.current.length > 0 && (
        <>
          <Typography variant="caption">{t('core:outgoingLinks')}:</Typography>
          <br />
          {links.current.map((link) => linkButton(link))}
        </>
      )}
      <Box display="block">
        <Typography variant="caption">
          {t('core:incomingLinks')} (
          {t('full text search should be enabled for this location')}):
        </Typography>
        <br />
        {indexExist.current ? (
          <>
            {inboundLinks.current &&
              inboundLinks.current.length > 0 &&
              inboundLinks.current.map((entry) => (
                <div>
                  {entry.name}: {entry.links.map((link) => linkButton(link))}
                  <br />
                </div>
              ))}{' '}
            {findInboundButton('reGenerateInbound')}
          </>
        ) : (
          findInboundButton('generateInbound')
        )}
      </Box>
    </Box>
  );
}

export default LinksTab;
