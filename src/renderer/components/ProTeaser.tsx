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

import { CloseDialogIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { openURLExternally } from '-/services/utils-io';
import { keyframes } from '@emotion/react';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import AutoAwesomeTwoToneIcon from '@mui/icons-material/AutoAwesomeTwoTone';
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import CameraTwoToneIcon from '@mui/icons-material/CameraTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import FolderTwoToneIcon from '@mui/icons-material/FolderTwoTone';
import HistoryTwoToneIcon from '@mui/icons-material/HistoryTwoTone';
import MapTwoToneIcon from '@mui/icons-material/MapTwoTone';
import ViewKanbanTwoToneIcon from '@mui/icons-material/ViewKanbanTwoTone';
import { Box, ButtonGroup, SvgIconTypeMap } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const floatAnim = keyframes`
  0%   { transform: translateY(0px)  scale(1); }
  50%  { transform: translateY(-7px) scale(1.15); }
  100% { transform: translateY(0px)  scale(1); }
`;

const PRO_ADS_STORAGE_KEY = 'tsProTeaserAdIndex';

interface ProAd {
  slideId: string;
  Icon: OverridableComponent<SvgIconTypeMap>;
  color: string;
  headlineKey: string;
  subtextKey: string;
}

const proAds: ProAd[] = [
  {
    slideId: 'kanban',
    Icon: ViewKanbanTwoToneIcon,
    color: '#a466aa',
    headlineKey: 'core:proTeaserKanbanHeadline',
    subtextKey: 'core:proTeaserKanbanSubtext',
  },
  {
    slideId: 'gallery',
    Icon: CameraTwoToneIcon,
    color: '#f7901e',
    headlineKey: 'core:proTeaserGalleryHeadline',
    subtextKey: 'core:proTeaserGallerySubtext',
  },
  {
    slideId: 'mapique',
    Icon: MapTwoToneIcon,
    color: '#33b5be',
    headlineKey: 'core:proTeaserMapiqueHeadline',
    subtextKey: 'core:proTeaserMapiqueSubtext',
  },
  {
    slideId: 'folderviz',
    Icon: AccountTreeTwoToneIcon,
    color: '#6aaa44',
    headlineKey: 'core:proTeaserFoldervizHeadline',
    subtextKey: 'core:proTeaserFoldervizSubtext',
  },
  {
    slideId: 'calendar',
    Icon: CalendarMonthTwoToneIcon,
    color: '#e57373',
    headlineKey: 'core:proTeaserCalendarHeadline',
    subtextKey: 'core:proTeaserCalendarSubtext',
  },
  {
    slideId: 'ai',
    Icon: AutoAwesomeTwoToneIcon,
    color: '#7c4dff',
    headlineKey: 'core:proTeaserAiHeadline',
    subtextKey: 'core:proTeaserAiSubtext',
  },
  {
    slideId: 'annotation',
    Icon: DescriptionTwoToneIcon,
    color: '#0288d1',
    headlineKey: 'core:proTeaserAnnotationHeadline',
    subtextKey: 'core:proTeaserAnnotationSubtext',
  },
  {
    slideId: 'revisions',
    Icon: HistoryTwoToneIcon,
    color: '#795548',
    headlineKey: 'core:proTeaserRevisionsHeadline',
    subtextKey: 'core:proTeaserRevisionsSubtext',
  },
  {
    slideId: 'folderColor',
    Icon: FolderTwoToneIcon,
    color: '#ff8f00',
    headlineKey: 'core:proTeaserFolderColorHeadline',
    subtextKey: 'core:proTeaserFolderColorSubtext',
  },
];

function getNextAdIndex(): number {
  const stored = parseInt(
    localStorage.getItem(PRO_ADS_STORAGE_KEY) ?? '-1',
    10,
  );
  const next = (stored + 1) % proAds.length;
  localStorage.setItem(PRO_ADS_STORAGE_KEY, String(next));
  return next;
}

interface Props {
  setShowTeaserBanner: (teaserVisibility: boolean) => void;
}

function ProTeaser(props: Props) {
  const { setShowTeaserBanner } = props;
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { t } = useTranslation();

  const [adIndex] = useState<number>(getNextAdIndex);
  const ad = proAds[adIndex];
  const { Icon } = ad;

  return (
    <Box
      sx={{
        display: 'block',
        marginBottom: 0,
        '&:hover .pro-teaser-icon': {
          animation: `${floatAnim} 1.2s ease-in-out infinite`,
          filter: `drop-shadow(0 0 6px ${ad.color}99)`,
        },
      }}
    >
      <CardContent
        sx={{
          paddingLeft: '5px',
          paddingRight: '5px',
          paddingTop: 0,
          paddingBottom: 0,
          textAlign: 'center',
          cursor: 'pointer',
        }}
      >
        <Typography variant="caption" sx={{ textTransform: 'lowercase' }}>
          <TsIconButton
            sx={{ right: '5px', position: 'absolute' }}
            size="small"
            aria-label="close"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowTeaserBanner(false);
            }}
          >
            <CloseDialogIcon fontSize="small" />
          </TsIconButton>
        </Typography>
        <div
          role="button"
          onClick={() => openProTeaserDialog(ad.slideId)}
          style={{ cursor: 'pointer' }}
        >
          <Icon
            className="pro-teaser-icon"
            sx={{
              fontSize: '44px',
              color: ad.color,
              mt: '2px',
              mb: '-4px',
              transition: 'filter 0.3s ease, color 0.3s ease',
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', lineHeight: 1.2 }}
          >
            {t(ad.headlineKey)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t(ad.subtextKey)}
          </Typography>
        </div>
      </CardContent>
      <CardActions
        sx={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: '2px',
        }}
      >
        <ButtonGroup>
          <TsButton
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              fontWeight: 300,
            }}
            variant="text"
            onClick={(event: any) => {
              event.preventDefault();
              event.stopPropagation();
              openProTeaserDialog(ad.slideId);
            }}
          >
            {t('showMeMore')}
          </TsButton>
          <TsButton
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              fontWeight: 300,
            }}
            variant="text"
            onClick={(event: any) => {
              event.preventDefault();
              event.stopPropagation();
              openURLExternally(Links.links.productsOverview, true);
            }}
          >
            {t('upgrade')}
          </TsButton>
        </ButtonGroup>
      </CardActions>
    </Box>
  );
}

export default ProTeaser;
