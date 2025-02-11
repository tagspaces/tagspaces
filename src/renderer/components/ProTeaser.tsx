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

import TsButton from '-/components/TsButton';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { openURLExternally } from '-/services/utils-io';
import CameraTwoToneIcon from '@mui/icons-material/CameraTwoTone';
import CloseIcon from '@mui/icons-material/Close';
import MapTwoToneIcon from '@mui/icons-material/MapTwoTone';
import ViewKanbanTwoToneIcon from '@mui/icons-material/ViewKanbanTwoTone';
import { ButtonGroup } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
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
    <>
      <CardContent
        style={{
          paddingLeft: 5,
          paddingRight: 5,
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
          <IconButton
            style={{ right: 5, marginTop: -10, position: 'absolute' }}
            size="small"
            aria-label="close"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setShowTeaserBanner(false);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
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
            style={{
              fontSize: 50,
              color: '#a466aa',
            }}
          />
          <CameraTwoToneIcon style={{ fontSize: 50, color: '#f7901e' }} />
          <MapTwoToneIcon style={{ fontSize: 50, color: '#33b5be' }} />
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
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={(event: any) => {
              event.preventDefault();
              event.stopPropagation();
              openProTeaserDialog();
            }}
          >
            {t('showMeMore')}
          </TsButton>
          <TsButton
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
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
    </>
  );
}

export default ProTeaser;
