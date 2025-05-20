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
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TS } from '-/tagspaces.namespace';
import { getTagLibrary } from '-/services/taglibrary-utils';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { Pro } from '-/pro';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { useSelector } from 'react-redux';
import { getSaveTagInLocation } from '-/reducers/settings';

type EditedTagLibraryContextData = {
  tagGroups: TS.TagGroup[];
  broadcast: BroadcastChannel;
  reflectTagLibraryChanged: () => void;
  refreshTagLibrary: (force?: boolean) => void;
  setTagGroups: (tg: TS.TagGroup[]) => void;
};

export const EditedTagLibraryContext =
  createContext<EditedTagLibraryContextData>({
    tagGroups: undefined,
    broadcast: undefined,
    reflectTagLibraryChanged: undefined,
    refreshTagLibrary: undefined,
    setTagGroups: undefined,
  });

export type EditedTagLibraryContextProviderProps = {
  children: React.ReactNode;
};

export const EditedTagLibraryContextProvider = ({
  children,
}: EditedTagLibraryContextProviderProps) => {
  // INITIAL VALUE from disk
  const [tagGroups, setTagGroups] = useState<TS.TagGroup[]>(getTagLibrary());
  const { getTagsFromLocations } = useTagGroupsLocationContext();
  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  // Generate a unique ID
  const instanceId = useRef<string>(getUuid());
  const broadcast = useMemo(() => new BroadcastChannel('tag-library-sync'), []);

  useEffect(() => {
    refreshTagLibrary();
  }, [saveTagInLocation]);

  // Listen for incoming broadcasts
  useEffect(() => {
    // Listen for messages from other instances
    broadcast.onmessage = (event: MessageEvent) => {
      const action = event.data as TS.BroadcastMessage;
      if (action.uuid === instanceId.current) return;

      if (action.type === 'tagLibraryChanged') {
        refreshTagLibrary(true);
      }
    };
    // clean up on unmount
    return () => {
      broadcast.close();
    };
  }, [broadcast]);

  function refreshTagLibrary(force = false) {
    if (Pro && saveTagInLocation) {
      getTagsFromLocations().then((locationTagGroups) => {
        if (locationTagGroups && Object.keys(locationTagGroups).length > 0) {
          // rebuild the flattened array
          const fresh: TS.TagGroup[] = [
            ...getTagLibrary(),
            ...Object.entries(locationTagGroups).flatMap(([uuid, groups]) =>
              groups.map((g) => ({ ...g, locationId: uuid })),
            ),
          ];
          setTagGroups(fresh);
        }
      });
    } else if (force) {
      setTagGroups(getTagLibrary());
    }
  }

  function reflectTagLibraryChanged() {
    //refreshTagLibrary(true);
    broadcast.postMessage({
      uuid: instanceId.current,
      type: 'tagLibraryChanged',
    });
  }

  const context = useMemo(() => {
    return {
      tagGroups: tagGroups,
      broadcast: broadcast,
      setTagGroups,
      reflectTagLibraryChanged,
      refreshTagLibrary,
    };
  }, [tagGroups]);

  return (
    <EditedTagLibraryContext.Provider value={context}>
      {children}
    </EditedTagLibraryContext.Provider>
  );
};
