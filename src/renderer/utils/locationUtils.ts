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
 */

import AppConfig from '-/AppConfig';
import { CommonLocation } from '-/utils/CommonLocation';
// Note: locationType import kept local to this module for flexibility

/**
 * Find a location by ID, with optional fallback to current location
 * @param locations - Array of locations to search
 * @param locationId - ID to find (optional)
 * @param currentId - Current location ID for fallback
 * @returns The location if found, undefined otherwise
 */
export function findLocationById(
  locations: CommonLocation[],
  locationId?: string,
  currentId?: string,
): CommonLocation | undefined {
  const targetId = locationId || currentId;
  return locations.find((l) => l.uuid === targetId);
}

/**
 * Find first read-write location with priority for default locations
 * @param locations - Array of locations to search
 * @returns First RW location (prioritizing default), or undefined if none found
 */
export function getFirstReadWriteLocation(
  locations: CommonLocation[],
): CommonLocation | undefined {
  return (
    locations.find((location) => location.isDefault && !location.isReadOnly) ||
    locations.find((location) => !location.isReadOnly)
  );
}

/**
 * Find location by type
 * @param locations - Array of locations to search
 * @param type - Location type to find
 * @returns Location of specified type, or undefined if not found
 */
export function findLocationByType(
  locations: CommonLocation[],
  type: string | number,
): CommonLocation | undefined {
  return locations.find((l) => l.type === type);
}

/**
 * Find local location
 * @param locations - Array of locations to search
 * @returns Local location if found, undefined otherwise
 */
export function findLocalLocation(
  locations: CommonLocation[],
): CommonLocation | undefined {
  // Import inline to avoid circular dependencies in tests
  const { locationType } = require('@tagspaces/tagspaces-common/misc');
  return findLocationByType(locations, locationType.TYPE_LOCAL);
}

/**
 * Get directory separator for a location, with AppConfig fallback
 * @param location - Location to get separator for
 * @returns Directory separator string
 */
export function getDirSeparatorForLocation(
  location: CommonLocation | undefined,
): string {
  return location?.getDirSeparator() ?? AppConfig.dirSeparator;
}

/**
 * Get position (index) of location in array
 * @param locations - Array of locations
 * @param locationId - Location UUID to find
 * @returns Index of location, or -1 if not found
 */
export function getLocationPositionByUUID(
  locations: CommonLocation[],
  locationId: string,
): number {
  return locations.findIndex((location) => location.uuid === locationId);
}

/**
 * Validate move location parameters
 * @param locations - Array of locations
 * @param locationUUID - UUID of location to move
 * @param newIndex - Target index
 * @throws Error if parameters are invalid
 * @returns Validation result with current and new indices
 */
export function validateMoveLocation(
  locations: CommonLocation[],
  locationUUID: string,
  newIndex: number,
): { currentIndex: number; newIndex: number } {
  if (!Array.isArray(locations)) {
    throw new Error('Locations must be an array');
  }

  if (newIndex < 0 || newIndex >= locations.length) {
    throw new Error(
      `Invalid newIndex: ${newIndex}. Must be between 0 and ${locations.length - 1}`,
    );
  }

  const currentIndex = getLocationPositionByUUID(locations, locationUUID);
  if (currentIndex === -1) {
    throw new Error(`Location with UUID ${locationUUID} not found`);
  }

  return { currentIndex, newIndex };
}

/**
 * Check if location can move up
 * @param locations - Array of locations
 * @param locationUUID - UUID of location to check
 * @returns true if location can move up, false otherwise
 */
export function canMoveUp(
  locations: CommonLocation[],
  locationUUID: string,
): boolean {
  const index = getLocationPositionByUUID(locations, locationUUID);
  return index > 0;
}

/**
 * Check if location can move down
 * @param locations - Array of locations
 * @param locationUUID - UUID of location to check
 * @returns true if location can move down, false otherwise
 */
export function canMoveDown(
  locations: CommonLocation[],
  locationUUID: string,
): boolean {
  const index = getLocationPositionByUUID(locations, locationUUID);
  return index >= 0 && index < locations.length - 1;
}

/**
 * Check if location exists in array
 * @param locations - Array of locations
 * @param locationUUID - UUID to search for
 * @returns true if location exists, false otherwise
 */
export function locationExists(
  locations: CommonLocation[],
  locationUUID: string,
): boolean {
  return locations.some((location) => location.uuid === locationUUID);
}

/**
 * Get location path, preferring path over paths array
 * @param location - Location to get path from
 * @returns Path string, or empty string if no path found
 */
export function getLocationPathString(location: CommonLocation): string {
  if (!location) return '';
  return location.path || location.paths?.[0] || '';
}
