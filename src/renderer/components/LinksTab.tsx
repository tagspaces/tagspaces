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
import { ProTooltip } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import TsToggleButton from '-/components/TsToggleButton';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { getEntryContainerTab } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, ToggleButtonGroup, Typography } from '@mui/material';
import { extractLinks } from '@tagspaces/tagspaces-common/misc';
import {
  cleanRootPath,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import InfoIcon from './InfoIcon';
import TsTooltip from './TsTooltip';

interface Props {}

const LinksGraph: any = Pro && Pro.UI ? Pro.UI.LinksGraph : false;

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
  const [view, setView] = useState<'graph' | 'list'>(
    LinksGraph ? 'graph' : 'list',
  );
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
    createLocationIndex(location, true, true).then(() => setInboundLinks());
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
    if (link.type === 'relative') {
      buttonTitle = url;
    } else if (link.type === 'url') {
      try {
        buttonTitle = new URL(url).hostname;
      } catch (e) {
        console.log('Error parsing URL: ' + e);
      }
    } else if (link.type === 'tslink') {
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
          onClick={() => openLink(url, { fullWidth: false })}
          variant="text"
          startIcon={
            <TsTooltip title={link.type}>
              <LinkIcon />
            </TsTooltip>
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
          onClick={() => openLink(sharingLink, { fullWidth: false })}
          variant="text"
          startIcon={
            <TsTooltip title={fsEntry.path}>
              <LinkIcon />
            </TsTooltip>
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

  const listView = (
    <>
      <Box
        sx={{
          display: 'block',
        }}
      >
        {links.current && links.current.length > 0 && (
          <>
            <Typography variant="body2">
              <b>{t('core:outgoingLinks')}</b> (
              {openedEntry.isFile
                ? t('from the file content and/or its description')
                : t('from the folder description')}
              ):
            </Typography>
            <br />
            {links.current?.map((link) => outgoingLinkButton(link))}
          </>
        )}
      </Box>
      <Box
        sx={{
          display: 'block',
        }}
      >
        <Typography variant="body2">
          <b>{t('core:incomingLinks')}</b> (
          {t('from content and description of other files and folders')})
          <InfoIcon tooltip="Full text search with link extraction for the current location is needed for this feature." />
          :
        </Typography>
        <br />
        {inboundLinks.current?.length ? (
          <>{inboundLinks.current.map((entry) => incomingLinkButton(entry))}</>
        ) : (
          <>
            <Typography variant="caption">No incoming links found</Typography>
            <br />
          </>
        )}
      </Box>
    </>
  );

  const graphView = LinksGraph ? (
    <LinksGraph
      centerLabel={openedEntry.name || openedEntry.path}
      outgoing={links.current}
      incoming={inboundLinks.current}
      findLocation={findLocation}
      onNavigate={(url: string) => openLink(url, { fullWidth: false })}
      height="100%"
    />
  ) : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={(_, v) => {
            if (!v) return;
            if (v === 'graph' && !LinksGraph) return;
            setView(v);
          }}
          data-tid="linksViewToggleTID"
        >
          <TsToggleButton value="graph" data-tid="linksViewGraphTID">
            <ProTooltip tooltip={t('core:linksGraphView')}>
              <AccountTreeIcon
                fontSize="small"
                sx={!LinksGraph ? { opacity: 0.4 } : undefined}
              />
            </ProTooltip>
          </TsToggleButton>
          <TsToggleButton
            value="list"
            data-tid="linksViewListTID"
            tooltip={t('core:linksListView')}
          >
            <ViewListIcon fontSize="small" />
          </TsToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <TsButton
          loading={isIndexing !== undefined}
          data-tid={'generateInboundTID'}
          onClick={refreshInboundLinks}
          startIcon={<ReloadIcon />}
        >
          {t('core:generateInbound')}
        </TsButton>
      </Box>

      {view === 'graph' && LinksGraph ? graphView : listView}
    </Box>
  );
}

export default LinksTab;
