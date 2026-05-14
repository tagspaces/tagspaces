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

import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';

export type MoveCopyInvalidReason =
  | 'no-target'
  | 'cyclic'
  | 'noop'
  | 'readonly'
  | 'cloud-cross-location';

export interface MoveCopyValidity {
  disabled: boolean;
  reason?: MoveCopyInvalidReason;
}

function isCloud(loc?: CommonLocation): boolean {
  // WebDAV is deprecated and not considered; only S3 counts as cloud here.
  return !!loc && loc.haveObjectStoreSupport();
}

function normalize(p: string): string {
  if (!p) return '';
  // Strip a trailing separator (either kind) so descendant checks compare cleanly.
  return p.replace(/[\\/]+$/, '').replace(/\\/g, '/');
}

interface Params {
  entries: TS.FileSystemEntry[];
  targetPath: string;
  targetLocation?: CommonLocation;
  sourceLocation?: CommonLocation;
  mode: 'move' | 'copy';
}

export function computeMoveCopyValidity({
  entries,
  targetPath,
  targetLocation,
  sourceLocation,
  mode,
}: Params): MoveCopyValidity {
  // S3 bucket roots have an empty `path`, so treat any non-null `targetPath`
  // as a valid destination as long as the location itself is selected.
  if (!targetLocation || targetPath === undefined || targetPath === null) {
    return { disabled: true, reason: 'no-target' };
  }

  // Read-only destination — always disabled.
  if (targetLocation.isReadOnly) {
    return { disabled: true, reason: 'readonly' };
  }

  // Cloud cross-location — v1 limitation.
  // TODO(cloud-cross-location): drop this branch when copyFiles/moveFiles gain
  // a download-then-upload pipeline that handles S3↔local, WebDAV↔local, and
  // S3↔S3-across-buckets with unified progress reporting + sidecar transfer.
  // See MOVE_COPY_DIALOG_REDESIGN_PLAN.md "Out of scope" for the followup spec.
  if (
    sourceLocation &&
    targetLocation.uuid !== sourceLocation.uuid &&
    (isCloud(targetLocation) || isCloud(sourceLocation))
  ) {
    return { disabled: true, reason: 'cloud-cross-location' };
  }

  const target = normalize(targetPath);
  const selectedDirs = entries.filter((e) => !e.isFile);
  const sep = targetLocation.getDirSeparator?.() || '/';

  // Cyclic: target is one of the selected folders or descendant of one.
  for (const d of selectedDirs) {
    const dp = normalize(d.path);
    if (!dp) continue;
    if (target === dp || target.startsWith(dp + '/')) {
      return { disabled: true, reason: 'cyclic' };
    }
  }

  // No-op move: target equals the parent dir of every selected entry.
  if (mode === 'move' && entries.length > 0) {
    const allInTarget = entries.every((entry) => {
      const parent = normalize(extractContainingDirectoryPath(entry.path, sep));
      return parent === target;
    });
    if (allInTarget) {
      return { disabled: true, reason: 'noop' };
    }
  }

  return { disabled: false };
}

export function getValidityMessageKey(
  reason?: MoveCopyInvalidReason,
): string | undefined {
  switch (reason) {
    case 'cyclic':
      return 'core:cantMoveIntoSelectedFolder';
    case 'noop':
      return 'core:filesAlreadyInThisFolder';
    case 'readonly':
      return 'core:locationIsReadOnly';
    case 'cloud-cross-location':
      return 'core:cloudCrossLocationNotSupported';
    case 'no-target':
    default:
      return undefined;
  }
}
