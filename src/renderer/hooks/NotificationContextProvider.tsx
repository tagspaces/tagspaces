/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { setGlobalErrorNotifier } from '-/services/globalErrorHandlers';

export type NotificationType =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type AppNotification = {
  key: number;
  text: string;
  tid: string;
  notificationType: NotificationType;
  autohide: boolean;
  /** How many times the same text+type was shown while still visible */
  count: number;
  /** Changes whenever the toast is re-triggered, restarting its timer */
  stamp: number;
  /** Set while the exit animation runs; removed in onExited */
  closing: boolean;
};

/** Older toasts beyond this are dropped (oldest non-error first) */
const MAX_NOTIFICATIONS = 3;

type NotificationContextData = {
  openConfirmDialog: (
    title: string,
    description: string,
    callback?: (result: boolean | string) => void,
    cancelTID?: string,
    confirmTID?: string,
    confirmContentTID?: string,
    list?: string[],
    prompt?: string,
    help?: string,
    customConfirmText?: string,
    customCancelText?: string,
  ) => void;
  closeConfirmDialog: () => void;
  /** Visible toasts, oldest first */
  notifications: AppNotification[];
  showNotification: (
    text: string,
    notificationType?: NotificationType,
    autohide?: boolean,
    tid?: string,
  ) => void;
  hideNotifications: (excludeTypes?: string[]) => void;
  /** Starts the exit animation of one toast */
  dismissNotification: (key: number) => void;
  /** Removes a toast once its exit animation finished */
  removeNotification: (key: number) => void;
  isGeneratingThumbs: boolean;
  setGeneratingThumbs: (isGen: boolean) => void;
  //NotificationTypes: 'default' | 'error';
};

export const NotificationContext = createContext<NotificationContextData>({
  openConfirmDialog: undefined,
  closeConfirmDialog: undefined,
  notifications: [],
  showNotification: () => {},
  hideNotifications: () => {},
  dismissNotification: () => {},
  removeNotification: () => {},
  isGeneratingThumbs: false,
  setGeneratingThumbs: () => {},
  //NotificationTypes: 'default'
});

export type NotificationContextProviderProps = {
  children: React.ReactNode;
};

export const NotificationContextProvider = ({
  children,
}: NotificationContextProviderProps) => {
  const [isConfirmDialogOpened, setConfirmDialogOpened] =
    useState<boolean>(false);
  const confirmTitle = useRef<string>('Confirm Dialog');
  const confirmDescription = useRef<string>('');
  const confirmCallback = useRef<(result: boolean | string) => void>(undefined);
  const cancelDialogTID = useRef<string>('cancelDialogTID');
  const confirmDialogTID = useRef<string>('confirmDialogTID');
  const confirmDialogContentTID = useRef<string>('confirmDialogContentTID');
  const listItems = useRef<string[]>(undefined);
  const prompt = useRef<string>(undefined);
  const help = useRef<string>(undefined);
  const customConfirmText = useRef<string>(undefined);
  const customCancelText = useRef<string>(undefined);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const nextKey = useRef<number>(1);
  const [isGeneratingThumbs, setGeneratingThumbs] = useState<boolean>(false);

  function openConfirmDialog(
    title: string,
    description: string,
    callback = undefined,
    cancelTID = 'cancelDialogTID',
    confirmTID = 'confirmDialogTID',
    confirmContentTID = 'confirmDialogContentTID',
    list: string[] = undefined,
    promptTxt: string = undefined,
    helpTxt: string = undefined,
    confirmText: string = undefined,
    cancelText: string = undefined,
  ) {
    confirmTitle.current = title;
    confirmDescription.current = description;
    confirmCallback.current = callback;
    cancelDialogTID.current = cancelTID;
    confirmDialogTID.current = confirmTID;
    confirmDialogContentTID.current = confirmContentTID;
    listItems.current = list;
    prompt.current = promptTxt;
    customConfirmText.current = confirmText;
    customCancelText.current = cancelText;
    help.current = helpTxt;
    setConfirmDialogOpened(true);
  }

  function closeConfirmDialog() {
    setConfirmDialogOpened(false);
  }

  const showNotification = useCallback(
    (
      text: string,
      notificationType: NotificationType = 'default',
      autohide = true,
      tid = 'notificationTID',
    ) => {
      if (!text) {
        return;
      }
      const stamp = nextKey.current;
      nextKey.current += 1;
      setNotifications((prev) => {
        const existing = prev.find(
          (n) =>
            !n.closing &&
            n.text === text &&
            n.notificationType === notificationType,
        );
        if (existing) {
          // Same message again: bump the counter and restart its timer
          // instead of stacking a duplicate.
          return [
            ...prev.filter((n) => n !== existing),
            {
              ...existing,
              tid,
              autohide: existing.autohide && autohide,
              count: existing.count + 1,
              stamp,
            },
          ];
        }
        const next = [
          ...prev,
          {
            key: stamp,
            text,
            tid,
            notificationType,
            autohide,
            count: 1,
            stamp,
            closing: false,
          },
        ];
        // Drop the oldest toasts over the cap, sparing errors while possible
        // so a burst of "done" messages cannot push an error off the screen.
        while (next.filter((n) => !n.closing).length > MAX_NOTIFICATIONS) {
          const victim =
            next.find((n) => !n.closing && n.notificationType !== 'error') ??
            next.find((n) => !n.closing);
          next.splice(next.indexOf(victim), 1);
        }
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    setGlobalErrorNotifier((text, notificationType, autohide, tid) => {
      showNotification(
        text,
        notificationType ?? 'error',
        autohide ?? true,
        tid ?? 'globalErrorTID',
      );
    });
    return () => setGlobalErrorNotifier(null);
  }, [showNotification]);

  const hideNotifications = useCallback((excludeTypes: string[] = []) => {
    setNotifications((prev) =>
      prev.map((n) =>
        excludeTypes.includes(n.notificationType) ? n : { ...n, closing: true },
      ),
    );
  }, []);

  const dismissNotification = useCallback((key: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.key === key ? { ...n, closing: true } : n)),
    );
  }, []);

  const removeNotification = useCallback((key: number) => {
    setNotifications((prev) => prev.filter((n) => n.key !== key));
  }, []);

  const context = useMemo(() => {
    return {
      notifications,
      isGeneratingThumbs,
      setGeneratingThumbs,
      showNotification,
      hideNotifications,
      dismissNotification,
      removeNotification,
      openConfirmDialog,
      closeConfirmDialog,
    };
  }, [
    notifications,
    isGeneratingThumbs,
    showNotification,
    hideNotifications,
    dismissNotification,
    removeNotification,
  ]);

  return (
    <NotificationContext.Provider value={context}>
      {children}
      <ConfirmDialog
        open={isConfirmDialogOpened}
        onClose={() => setConfirmDialogOpened(false)}
        title={confirmTitle.current}
        content={confirmDescription.current}
        confirmCallback={confirmCallback.current}
        cancelDialogTID={cancelDialogTID.current}
        confirmDialogTID={confirmDialogTID.current}
        confirmDialogContentTID={confirmDialogContentTID.current}
        list={listItems.current}
        prompt={prompt.current}
        helpText={help.current}
        customConfirmText={customConfirmText.current}
        customCancelText={customCancelText.current}
      />
    </NotificationContext.Provider>
  );
};
