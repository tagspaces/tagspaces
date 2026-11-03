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

/**
 * Moves the folders in front of the files, keeping the existing order within
 * each group, so it can be applied on top of any sort criteria and direction.
 */
export function foldersFirst<T extends { isFile: boolean }>(entries: T[]): T[] {
  const folders: T[] = [];
  const files: T[] = [];
  for (const entry of entries) {
    (entry.isFile ? files : folders).push(entry);
  }
  return folders.concat(files);
}
