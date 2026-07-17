/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import {
  BACK_BUTTON_EVENT,
  CLOSE_ENTRY_REQUEST_EVENT,
  closeTopModal,
  getTopModal,
  isAtLocationRoot,
  resolveBackAction,
} from '-/services/mobileBackAction';
import useEventListener from '-/utils/useEventListener';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const DOUBLE_BACK_EXIT_WINDOW_MS = 2000;

/**
 * Unified back-action chain for mobile: handles the Android hardware back
 * button / system back gesture (dispatched as BACK_BUTTON_EVENT by
 * io-capacitor) with the priority: close drawer → dismiss modal → close
 * opened entry → exit search → go up one folder → double-back to exit.
 * Mounted once in MainPage, which owns the drawer state.
 */
export default function useMobileBackHandler(
  drawerOpen: boolean,
  closeDrawer: () => void,
) {
  const { t } = useTranslation();
  const { openedEntry } = useOpenedEntryContext();
  const {
    isSearchMode,
    currentDirectoryPath,
    currentLocationPath,
    loadParentDirectoryContent,
  } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const lastBackPress = useRef<number>(0);

  useEventListener(BACK_BUTTON_EVENT, () => {
    const action = resolveBackAction({
      drawerOpen,
      modalOpen: !!getTopModal(),
      hasOpenedEntry: !!openedEntry,
      isSearchMode,
      hasDirectory: !!currentDirectoryPath,
      isAtLocationRoot: isAtLocationRoot(
        currentDirectoryPath,
        currentLocationPath,
      ),
    });
    switch (action) {
      case 'closeDrawer':
        closeDrawer();
        break;
      case 'closeModal':
        closeTopModal();
        break;
      case 'closeEntry':
        window.dispatchEvent(
          new CustomEvent(CLOSE_ENTRY_REQUEST_EVENT, { cancelable: true }),
        );
        break;
      case 'exitSearch':
      case 'goUp':
        loadParentDirectoryContent();
        break;
      case 'exitApp':
        if (Date.now() - lastBackPress.current < DOUBLE_BACK_EXIT_WINDOW_MS) {
          if (AppConfig.isCapacitor) {
            // eslint-disable-next-line global-require
            const ioAPI = require('-/services/io-capacitor');
            ioAPI.quitApp();
          }
        } else {
          lastBackPress.current = Date.now();
          showNotification(t('core:pressBackAgainToExit'));
        }
        break;
      default:
        break;
    }
  });
}
