/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as AppActions,
  AppDispatch,
  getOpenedFiles,
  isReadOnlyMode,
  OpenedEntry
} from '-/reducers/app';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';

type DescriptionContextData = {
  description: string;
  setDescription: (description: string) => void;
  saveDescription: () => void;
};

export const DescriptionContext = createContext<DescriptionContextData>({
  description: undefined,
  setDescription: () => {},
  saveDescription: () => {}
});

export type DescriptionContextProviderProps = {
  children: React.ReactNode;
};

export const DescriptionContextProvider = ({
  children
}: DescriptionContextProviderProps) => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const readOnlyMode = useSelector(isReadOnlyMode);
  const openedFiles: Array<OpenedEntry> = useSelector(getOpenedFiles);
  const openedFile: OpenedEntry = openedFiles[0];
  // const [ignored, forceUpdate] = useReducer(x => x + 1, 0, undefined);

  const description = useRef<string>(openedFile.description);

  useEffect(() => {
    if (openedFile.description !== description.current) {
      description.current = openedFile.description;
    } /*else {
      forceUpdate();
    }*/
  }, [openedFile.description]);

  const saveDescription = () => {
    if (readOnlyMode) {
      return;
    }
    if (!Pro) {
      dispatch(
        AppActions.showNotification(t('core:thisFunctionalityIsAvailableInPro'))
      );
      return;
    }
    if (!Pro.MetaOperations) {
      dispatch(
        AppActions.showNotification(t('Saving description not supported'))
      );
      return;
    }
    if (description.current !== undefined) {
      if (openedFile.locationId) {
        dispatch(AppActions.switchLocationTypeByID(openedFile.locationId)).then(
          currentLocationId => {
            saveMetaData()
              .then(() =>
                dispatch(
                  AppActions.switchCurrentLocationType(currentLocationId)
                )
              )
              .catch(error => {
                console.warn('Error saving description ' + error);
                dispatch(
                  AppActions.switchCurrentLocationType(currentLocationId)
                );
                dispatch(
                  AppActions.showNotification(t('Error saving description'))
                );
              });
          }
        );
      } else {
        console.debug(
          'openedFile:' +
            openedFile.path +
            ' dont have locationId! Current Location can be changed. Trying to save opened file in current location'
        );
        saveMetaData();
      }
    }
  };

  function saveMetaData() {
    return Pro.MetaOperations.saveFsEntryMeta(openedFile.path, {
      description: description.current
    }).then(entryMeta =>
      dispatch(AppActions.updateOpenedFile(openedFile.path, entryMeta))
    );
  }

  function setDescription(d: string) {
    description.current = d;
  }

  const context = useMemo(() => {
    return {
      description: description.current,
      setDescription,
      saveDescription
    };
  }, [description.current, openedFile.description]);

  return (
    <DescriptionContext.Provider value={context}>
      {children}
    </DescriptionContext.Provider>
  );
};
