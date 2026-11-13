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

import AppConfig from '-/AppConfig';
import {
  CloseIcon,
  NotificationErrorIcon,
  NotificationInfoIcon,
  NotificationSuccessIcon,
  NotificationUpdateIcon,
  NotificationWarningIcon,
} from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import {
  AppNotification,
  NotificationType,
} from '-/hooks/NotificationContextProvider';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { getLastPublishedVersion, isDesktopMode } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { useSwipeToDismiss } from '-/utils/useSwipeToDismiss';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import Links from 'assets/links';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Pro } from '../pro';
import {
  actions as AppActions,
  AppDispatch,
  isUpdateAvailable,
} from '../reducers/app';

/**
 * Phone layout in mobile mode: lift the stack over the perspective FAB in
 * FolderContainer (48px, ~20px from the bottom) and the drawer's bottom
 * navigation, so a toast never hides them.
 */
const MOBILE_BOTTOM_CLEARANCE = 76;
/** iOS home indicator / Android gesture bar; only set on Capacitor */
const SAFE_BOTTOM = 'var(--sab, 0px)';

/** Auto-hide duration per type; errors and warnings stay longer to be read */
const DURATIONS: Record<NotificationType, number> = {
  default: 4000,
  success: 3000,
  info: 4000,
  warning: 6000,
  error: 8000,
};

type ToastCardProps = {
  tid?: string;
  closeTid?: string;
  /** Drives the accent color, icon and ARIA role */
  type?: NotificationType;
  /** Overrides the icon derived from `type` */
  icon?: React.ReactNode;
  message: React.ReactNode;
  secondary?: React.ReactNode;
  count?: number;
  actions?: React.ReactNode;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

function ToastCard({
  tid,
  closeTid,
  type = 'default',
  icon,
  message,
  secondary,
  count,
  actions,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ToastCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const accent =
    type === 'default'
      ? theme.palette.text.secondary
      : theme.palette[type].main;
  const typeIcon = {
    default: null,
    info: <NotificationInfoIcon fontSize="small" />,
    success: <NotificationSuccessIcon fontSize="small" />,
    warning: <NotificationWarningIcon fontSize="small" />,
    error: <NotificationErrorIcon fontSize="small" />,
  }[type];
  const shownIcon = icon ?? typeIcon;
  const urgent = type === 'error' || type === 'warning';
  const swipe = useSwipeToDismiss(onClose);
  const tint = type === 'default' ? 0 : 0.08;

  return (
    <Paper
      ref={swipe.ref}
      onPointerDown={swipe.handlers.onPointerDown}
      onPointerMove={swipe.handlers.onPointerMove}
      onPointerUp={swipe.handlers.onPointerUp}
      onPointerCancel={swipe.handlers.onPointerCancel}
      onClickCapture={swipe.handlers.onClickCapture}
      style={swipe.style}
      data-tid={tid}
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      elevation={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      sx={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        py: 1.25,
        pl: 1.75,
        pr: 0.75,
        borderRadius: AppConfig.defaultCSSRadius,
        border: '1px solid',
        borderColor:
          type === 'default' ? theme.palette.divider : alpha(accent, 0.35),
        backgroundColor: theme.palette.background.paper,
        backgroundImage: `linear-gradient(${alpha(accent, tint)}, ${alpha(accent, tint)})`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      {shownIcon && (
        <Box
          sx={{
            display: 'flex',
            color: accent,
            // align with the first text line
            mt: '7px',
          }}
        >
          {shownIcon}
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0, py: '6px' }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {message}
          {count > 1 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 0.75,
                borderRadius: AppConfig.defaultCSSRadius,
                fontSize: '0.75em',
                fontWeight: 600,
                color: accent,
                backgroundColor: alpha(accent, 0.12),
              }}
            >
              ×{count}
            </Box>
          )}
        </Typography>
        {secondary && (
          <Typography
            variant="caption"
            noWrap
            component="div"
            sx={{ color: theme.palette.text.secondary, mt: 0.25 }}
          >
            {secondary}
          </Typography>
        )}
        {actions && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: AppConfig.defaultSpaceBetweenButtons,
              mt: 1,
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      {onClose && (
        <TsIconButton
          data-tid={closeTid}
          aria-label={t('core:closeButton')}
          size="small"
          onClick={onClose}
          sx={{ color: theme.palette.text.secondary }}
        >
          <CloseIcon fontSize="small" />
        </TsIconButton>
      )}
    </Paper>
  );
}

function NotificationToast({
  notification,
}: {
  notification: AppNotification;
}) {
  const { dismissNotification, removeNotification } = useNotificationContext();
  const [paused, setPaused] = useState(false);
  const { key, autohide, stamp, notificationType, closing } = notification;

  useEffect(() => {
    if (!autohide || paused || closing) {
      return undefined;
    }
    const timer = setTimeout(
      () => dismissNotification(key),
      DURATIONS[notificationType] ?? DURATIONS.default,
    );
    return () => clearTimeout(timer);
  }, [
    key,
    autohide,
    stamp,
    paused,
    closing,
    notificationType,
    dismissNotification,
  ]);

  return (
    <Collapse
      in={!closing}
      appear
      timeout={200}
      onExited={() => removeNotification(key)}
    >
      <Box sx={{ pt: 1 }}>
        <ToastCard
          tid={notification.tid}
          closeTid={`close${notification.tid}`}
          type={notificationType}
          message={notification.text}
          count={notification.count}
          onClose={() => dismissNotification(key)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        />
      </Box>
    </Collapse>
  );
}

function PageNotification() {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isGeneratingThumbs, setGeneratingThumbs, notifications } =
    useNotificationContext();
  const { findLocation } = useCurrentLocationContext();
  const { isIndexing, indexingProgress, cancelDirectoryIndexing } =
    useLocationIndexContext();
  const updateAvailable = useSelector(isUpdateAvailable);
  const lastPublishedVersion = useSelector(getLastPublishedVersion);
  const desktopMode = useSelector(isDesktopMode);

  const skipRelease = () => {
    dispatch(AppActions.setUpdateAvailable(false));
  };

  const openChangelogPage = () => {
    openURLExternally(Links.links.changelogURL, true);
  };

  const getLatestVersion = () => {
    if (Pro) {
      openURLExternally(Links.links.downloadProURL, true);
    } else {
      openURLExternally(Links.links.downloadURL, true);
    }
    dispatch(AppActions.setUpdateAvailable(false));
  };

  const progressIcon = <CircularProgress size={18} thickness={5} />;

  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        zIndex: theme.zIndex.snackbar,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        left: 12,
        right: 12,
        bottom: `calc(${SAFE_BOTTOM} + ${desktopMode ? 12 : MOBILE_BOTTOM_CLEARANCE}px)`,
        [theme.breakpoints.up('sm')]: {
          left: '50%',
          right: 'auto',
          bottom: `calc(${SAFE_BOTTOM} + 24px)`,
          transform: 'translateX(-50%)',
          width: 420,
        },
      })}
    >
      {notifications.map((n) => (
        <NotificationToast key={n.key} notification={n} />
      ))}
      <Collapse in={isGeneratingThumbs} unmountOnExit timeout={200}>
        <Box sx={{ pt: 1 }}>
          <ToastCard
            icon={progressIcon}
            message={t('core:loadingOrGeneratingThumbnails')}
            onClose={() => setGeneratingThumbs(false)}
          />
        </Box>
      </Collapse>
      <Collapse in={isIndexing !== undefined} unmountOnExit timeout={200}>
        <Box sx={{ pt: 1 }}>
          <ToastCard
            icon={progressIcon}
            message={`${t('core:indexing')}: ${findLocation(isIndexing)?.name ?? ''}${
              indexingProgress ? `  •  ${indexingProgress.count}` : ''
            }`}
            secondary={indexingProgress?.folder}
            actions={
              <TsButton
                onClick={() => cancelDirectoryIndexing(isIndexing)}
                data-tid="cancelDirectoryIndexing"
              >
                {t('core:cancelIndexing')}
              </TsButton>
            }
          />
        </Box>
      </Collapse>
      <Collapse in={updateAvailable} unmountOnExit timeout={200}>
        <Box sx={{ pt: 1 }}>
          <ToastCard
            type="info"
            icon={<NotificationUpdateIcon fontSize="small" />}
            message={t('versionAvailable', {
              version: lastPublishedVersion,
            })}
            onClose={skipRelease}
            actions={
              <>
                <TsButton onClick={openChangelogPage}>
                  {t('core:releaseNotes')}
                </TsButton>
                <TsButton variant="contained" onClick={getLatestVersion}>
                  {t('core:getItNow')}
                </TsButton>
              </>
            }
          />
        </Box>
      </Collapse>
    </Box>
  );
}

export default PageNotification;
