/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useMemo, useState } from 'react';

type NotificationStatus = {
  visible: boolean;
  text: string;
  tid: string;
  notificationType: 'default' | 'info' | 'warning' | 'error';
  autohide: boolean;
};

type NotificationContextData = {
  notificationStatus: NotificationStatus;
  showNotification: (
    text: string,
    notificationType?: 'default' | 'info' | 'warning' | 'error',
    autohide?: boolean,
    tid?: string,
  ) => void;
  hideNotifications: (excludeTypes?: string[]) => void;
  isGeneratingThumbs: boolean;
  setGeneratingThumbs: (isGen: boolean) => void;
  //NotificationTypes: 'default' | 'error';
};

export const NotificationContext = createContext<NotificationContextData>({
  notificationStatus: undefined,
  showNotification: () => {},
  hideNotifications: () => {},
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
  const [notificationStatus, setNotificationStatus] = useState<any>({
    visible: false,
    text: null,
    notificationType: 'default',
    autohide: true,
  });
  const [isGeneratingThumbs, setGeneratingThumbs] = useState<boolean>(false);

  function showNotification(
    text: string,
    notificationType = 'default',
    autohide = true,
    tid = 'notificationTID',
  ) {
    setNotificationStatus({
      visible: true,
      text,
      tid,
      notificationType,
      autohide,
    });
  }

  function hideNotifications(excludeTypes = []) {
    if (
      !excludeTypes.some((type) => type === notificationStatus.notificationType)
    ) {
      setNotificationStatus({
        visible: false,
        text: null,
        notificationType: 'default',
        autohide: true,
      });
    }
  }

  const context = useMemo(() => {
    return {
      notificationStatus,
      /*NotificationTypes: {
        default: 'default',
        error: 'error'
      },*/
      isGeneratingThumbs,
      setGeneratingThumbs,
      showNotification,
      hideNotifications,
    };
  }, [notificationStatus, isGeneratingThumbs]);

  return (
    <NotificationContext.Provider value={context}>
      {children}
    </NotificationContext.Provider>
  );
};
