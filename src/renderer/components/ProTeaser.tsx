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
import CameraTwoToneIcon from '@mui/icons-material/CameraTwoTone';
import MapTwoToneIcon from '@mui/icons-material/MapTwoTone';
import ViewKanbanTwoToneIcon from '@mui/icons-material/ViewKanbanTwoTone';
import { Box, ButtonGroup } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import { useTranslation } from 'react-i18next';

interface Props {
  setShowTeaserBanner: (teaserVisibility: boolean) => void;
}

function ProTeaser(props: Props) {
  const { setShowTeaserBanner } = props;
  const { openProTeaserDialog } = useProTeaserDialogContext();

  const { t } = useTranslation();
  return (
    <Box style={{ display: 'block', marginBottom: 0 }}>
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
        <Typography color="textSecondary" variant="caption">
          <span style={{ textTransform: 'lowercase' }}>
            {t('core:achieveMore')}
          </span>
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
        <br />
        <div
          role="button"
          onClick={() => openProTeaserDialog()}
          style={{
            cursor: 'pointer',
          }}
        >
          <b>TagSpaces Pro</b>
          {/* <img style={{ height: 35 }} src={ProTextLogo} alt="" /> */}
          <br />
          <ViewKanbanTwoToneIcon
            sx={{
              fontSize: '50px',
              color: '#a466aa',
            }}
          />
          <CameraTwoToneIcon sx={{ fontSize: '50px', color: '#f7901e' }} />
          <MapTwoToneIcon sx={{ fontSize: '50px', color: '#33b5be' }} />
          {/* <img style={{ maxHeight: 60 }} src={ProTeaserImage} alt="" /> */}
        </div>
      </CardContent>
      <CardActions
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: -10,
        }}
      >
        <ButtonGroup>
          <TsButton
            sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={(event: any) => {
              event.preventDefault();
              event.stopPropagation();
              openProTeaserDialog();
            }}
          >
            {t('showMeMore')}
          </TsButton>
          <TsButton
            sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
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
