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

import { getMaxRecentMoveCopyDestinations } from '-/reducers/settings';
import { instanceId } from '-/services/utils-io';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';

export interface RecentDestination {
  /** Absolute path within the location. */
  path: string;
  /** Stable location identifier. */
  locationId: string;
  /** Short label for the chip (typically the leaf folder name). */
  label: string;
  /** Timestamp at the moment of insertion. */
  ts: number;
}

interface RecentDestinationsContextData {
  recents: RecentDestination[];
  pushRecent: (item: Omit<RecentDestination, 'ts'>) => void;
  removeRecent: (locationId: string, path: string) => void;
  clearRecents: () => void;
}

const STORAGE_KEY = 'tsRecentMoveCopyDestinations';
const BROADCAST_KEY = 'recent-destinations-sync';

export const RecentDestinationsContext =
  createContext<RecentDestinationsContextData>({
    recents: [],
    pushRecent: () => undefined,
    removeRecent: () => undefined,
    clearRecents: () => undefined,
  });

function readRecents(): RecentDestination[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('RecentDestinations: failed to parse storage', e);
    return [];
  }
}

function writeRecents(list: RecentDestination[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('RecentDestinations: failed to write storage', e);
  }
}

export const useRecentDestinationsContext = () =>
  useContext(RecentDestinationsContext);

export type RecentDestinationsProviderProps = {
  children: React.ReactNode;
};

export const RecentDestinationsContextProvider = ({
  children,
}: RecentDestinationsProviderProps) => {
  const cap = useSelector(getMaxRecentMoveCopyDestinations);
  const recents = useRef<RecentDestination[]>(readRecents());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_KEY);
    channel.onmessage = (event: MessageEvent) => {
      const msg = event.data as { uuid: string };
      if (msg && msg.uuid !== instanceId) {
        recents.current = readRecents();
        forceUpdate();
      }
    };
    return () => {
      channel.close();
    };
  }, []);

  function broadcast() {
    try {
      const channel = new BroadcastChannel(BROADCAST_KEY);
      channel.postMessage({ uuid: instanceId });
      channel.close();
    } catch (e) {
      // BroadcastChannel may be unavailable in some environments — silent.
    }
  }

  function pushRecent(item: Omit<RecentDestination, 'ts'>) {
    if (!item.path || !item.locationId || cap <= 0) {
      return;
    }
    const next: RecentDestination = { ...item, ts: Date.now() };
    // Dedupe by (locationId, path); newest first; cap.
    const filtered = recents.current.filter(
      (r) => !(r.locationId === item.locationId && r.path === item.path),
    );
    filtered.unshift(next);
    recents.current = filtered.slice(0, cap);
    writeRecents(recents.current);
    forceUpdate();
    broadcast();
  }

  function removeRecent(locationId: string, path: string) {
    recents.current = recents.current.filter(
      (r) => !(r.locationId === locationId && r.path === path),
    );
    writeRecents(recents.current);
    forceUpdate();
    broadcast();
  }

  function clearRecents() {
    recents.current = [];
    writeRecents(recents.current);
    forceUpdate();
    broadcast();
  }

  const value = useMemo<RecentDestinationsContextData>(
    () => ({
      recents: recents.current,
      pushRecent,
      removeRecent,
      clearRecents,
    }),
    [recents.current],
  );

  return (
    <RecentDestinationsContext.Provider value={value}>
      {children}
    </RecentDestinationsContext.Provider>
  );
};
