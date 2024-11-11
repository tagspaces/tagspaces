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
import { ArrowBackIcon, CloseIcon } from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import { isDesktopMode } from '-/reducers/settings';
import DialogTitle, { DialogTitleProps } from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export type TSDialogTitle = DialogTitleProps & {
  dialogTitle: string;
  closeButtonTestId: string;
  onClose: () => void;
  actionSlot?: any;
};

function TsDialogTitle(props: TSDialogTitle) {
  const {
    style,
    dialogTitle: title,
    onClose,
    closeButtonTestId,
    children,
    actionSlot,
    ...rest
  } = props;
  const { t } = useTranslation();
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const closeButton = (
    <TsIconButton
      title={t('closeButtonDialog')}
      aria-label="close"
      tabIndex={-1}
      style={{
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
        position: 'absolute',
        right: 15,
        top: 15,
      }}
      data-tid={closeButtonTestId}
      onClick={onClose}
    >
      <CloseIcon />
    </TsIconButton>
  );

  const backButton = (
    <TsIconButton
      title={t('closeButtonDialog')}
      aria-label="close"
      tabIndex={-1}
      style={{
        float: 'left',
        marginLeft: AppConfig.isMacLike && desktopMode ? 40 : 0,
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
      }}
      data-tid={closeButtonTestId && closeButtonTestId}
      onClick={onClose}
    >
      <ArrowBackIcon />
    </TsIconButton>
  );

  return (
    <DialogTitle
      id={smallScreen ? '' : 'draggable-dialog-title'}
      {...rest}
      style={{
        cursor: smallScreen ? 'unset' : 'move',
        ...style,
      }}
    >
      {smallScreen ? ( // && !desktopMode
        <>
          <div style={{ display: 'flex' }}>
            {backButton}
            <span style={{ alignSelf: 'center', margin: '0 auto' }}>
              {title}
            </span>
            {actionSlot && (
              <span style={{ float: 'right', alignSelf: 'center' }}>
                {actionSlot}
              </span>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>{children}</div>
        </>
      ) : (
        <>
          {title}
          {children}
          {closeButton}
        </>
      )}
    </DialogTitle>
  );
}

export default TsDialogTitle;
