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
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';

type EditedTagLibraryContextData = {
  tagGroups: TS.TagGroup[];
  broadcast: BroadcastChannel;
  reflectTagLibraryChanged: (tg: TS.TagGroup[]) => void;
};

export const EditedTagLibraryContext =
  createContext<EditedTagLibraryContextData>({
    tagGroups: undefined,
    broadcast: undefined,
    reflectTagLibraryChanged: undefined,
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
  // Generate a unique ID
  const instanceId = useRef<string>(getUuid());
  const broadcast = useMemo(() => new BroadcastChannel('tag-library-sync'), []);

  // Listen for incoming broadcasts
  useEffect(() => {
    // Listen for messages from other instances
    broadcast.onmessage = (event: MessageEvent) => {
      const action = event.data as TS.BroadcastMessage;
      if (action.uuid === instanceId.current) return;

      if (action.type === 'tagLibraryChanged') {
        getTagsFromLocations().then((locationTagGroups) => {
          // rebuild the flattened array
          const fresh: TS.TagGroup[] = [
            ...getTagLibrary(),
            ...Object.entries(locationTagGroups).flatMap(([uuid, groups]) =>
              groups.map((g) => ({ ...g, locationId: uuid })),
            ),
          ];
          setTagGroups(fresh);
        });
      }
    };
    // clean up on unmount
    return () => {
      broadcast.close();
    };
  }, [broadcast]);

  function reflectTagLibraryChanged(newTags: TS.TagGroup[]) {
    setTagGroups(newTags);
    broadcast.postMessage({
      uuid: instanceId.current,
      type: 'tagLibraryChanged',
    });
  }

  const context = useMemo(() => {
    return {
      tagGroups: tagGroups,
      broadcast: broadcast,
      reflectTagLibraryChanged,
    };
  }, [tagGroups]);

  return (
    <EditedTagLibraryContext.Provider value={context}>
      {children}
    </EditedTagLibraryContext.Provider>
  );
};
