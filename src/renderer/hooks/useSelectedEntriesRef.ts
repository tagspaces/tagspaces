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

import { useEffect, useRef } from 'react';
import { TS } from '-/tagspaces.namespace';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

// Returns a ref whose .current is always the latest selectedEntries array.
// Read .current inside event handlers (onClick, onContextMenu, drag callbacks)
// to avoid subscribing the consumer to selection re-renders. Do not read
// .current during render — it is intentionally not a render dependency.
export function useSelectedEntriesRef() {
  const { selectedEntries } = useSelectedEntriesContext();
  const ref = useRef<TS.FileSystemEntry[]>(selectedEntries);
  useEffect(() => {
    ref.current = selectedEntries;
  }, [selectedEntries]);
  return ref;
}
