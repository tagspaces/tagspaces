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

import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
} from '@tagspaces/tagspaces-common/paths';

/**
 * Fired by io-capacitor's Capacitor backButton listener (Android hardware
 * back button and the system back gesture). Handled by useMobileBackHandler.
 */
export const BACK_BUTTON_EVENT = 'ts-back-button';

/**
 * Cancelable request to close the opened entry, handled inside EntryContainer
 * (the owner of the unsaved-changes-aware close path). Listeners call
 * preventDefault() when a confirm dialog will appear instead of an immediate
 * close, so gesture callers know to spring the overlay back.
 */
export const CLOSE_ENTRY_REQUEST_EVENT = 'ts-close-entry-request';

export type BackAction =
  | 'closeDrawer'
  | 'closeModal'
  | 'closeEntry'
  | 'exitSearch'
  | 'goUp'
  | 'exitApp';

export interface BackChainState {
  drawerOpen: boolean;
  modalOpen: boolean;
  hasOpenedEntry: boolean;
  isSearchMode: boolean;
  hasDirectory: boolean;
  isAtLocationRoot: boolean;
}

export function resolveBackAction(state: BackChainState): BackAction {
  if (state.drawerOpen) return 'closeDrawer';
  if (state.modalOpen) return 'closeModal';
  if (state.hasOpenedEntry) return 'closeEntry';
  if (state.isSearchMode) return 'exitSearch';
  if (state.hasDirectory && !state.isAtLocationRoot) return 'goUp';
  return 'exitApp';
}

/**
 * Top-most visible MUI modal (Dialog/Drawer/Menu/Popover all render a
 * .MuiModal-root). The :not(.MuiModal-hidden) filter excludes keepMounted
 * modals that are currently closed (e.g. ConfirmDialog). Class names verified
 * against @mui/material 9.x (Modal/modalClasses.js).
 */
export function getTopModal(): HTMLElement | null {
  const modals = document.querySelectorAll<HTMLElement>(
    '.MuiModal-root:not(.MuiModal-hidden)',
  );
  return modals.length > 0 ? modals[modals.length - 1] : null;
}

/**
 * Dismisses the top-most MUI modal by dispatching a synthetic Escape keydown.
 * MUI's Modal closes on Escape with an isTopModal() guard, so only the
 * top-most one reacts; modals with disableEscapeKeyDown stay open and the
 * back press is consumed as a no-op — the desired behavior for must-answer
 * dialogs.
 */
export function closeTopModal(): boolean {
  const modal = getTopModal();
  if (!modal) {
    return false;
  }
  const target =
    document.activeElement && modal.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)
      : modal;
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  return true;
}

export function isAtLocationRoot(
  currentDirectoryPath: string,
  locationRootPath: string,
): boolean {
  if (!currentDirectoryPath) {
    return true;
  }
  const normalize = (path: string) =>
    cleanTrailingDirSeparator(
      cleanFrontDirSeparator(path.replaceAll('\\', '/')),
    );
  return normalize(currentDirectoryPath) === normalize(locationRootPath || '');
}
