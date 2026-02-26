/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import mgrs from 'mgrs';
import OpenLocationCode from 'open-location-code-typescript';

// Regex patterns for coordinate validation
const PLUS_CODE_REGEX =
  /(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/;
const MGRS_REGEX =
  /^(\d{1,2})([C-HJ-NP-X])\s*([A-HJ-NP-Z])([A-HJ-NP-V])\s*(\d{1,5}\s*\d{1,5})$/i;
const LAT_LON_REGEX =
  /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
const WHITESPACE_REGEX = /\s+/g;

// Type definitions
interface Coordinates {
  lat: number;
  lng?: number;
  lon?: number;
}

/**
 * Parses geographic location from Plus Code or MGRS format
 * @param code - A Plus Code (e.g., 8FWH4HVG+3V) or MGRS code (e.g., 18SUJ7082315291)
 * @returns Coordinates object with lat/lng, or undefined if parsing fails
 */
export function parseGeoLocation(code: string): Coordinates | undefined {
  if (!code) {
    return undefined;
  }

  if (isPlusCode(code)) {
    try {
      const coord = OpenLocationCode.decode(code);
      const lat = Number(coord.latitudeLo.toFixed(7));
      const lng = Number(coord.longitudeLo.toFixed(7));
      return { lat, lng };
    } catch (error) {
      console.warn('Failed to parse Plus Code:', code, error);
      return undefined;
    }
  }

  if (isMgrsString(code)) {
    try {
      const [lng, lat] = mgrs.toPoint(code);
      return { lat, lng };
    } catch (error) {
      console.warn('Failed to parse MGRS code:', code, error);
      return undefined;
    }
  }

  return undefined;
}

/**
 * Checks if a string is a valid geographic tag (Plus Code or MGRS format)
 * @param code - String to validate
 * @returns true if the code is a valid Plus Code or MGRS code, false otherwise
 */
export function isGeoTag(code: string): boolean {
  return isPlusCode(code) || isMgrsString(code);
}

/**
 * Validates if a string is a valid Plus Code
 * Plus Codes are hierarchical geocodes with format: 8FWH4HVG+3V (10 chars) or shorter versions
 * @param plusCode - String to validate
 * @returns true if the string is a valid Plus Code format, false otherwise
 */
export function isPlusCode(plusCode: string): boolean {
  if (!plusCode || typeof plusCode !== 'string') {
    return false;
  }
  const upperCasedPlusCode = plusCode.toUpperCase();
  return PLUS_CODE_REGEX.test(upperCasedPlusCode);
}

/**
 * Validates if a string is a valid MGRS (Military Grid Reference System) code
 * MGRS codes are used for military grid coordinates: 18SUJ7082315291
 * @param code - String to validate
 * @returns true if the string is a valid MGRS code format, false otherwise
 */
export function isMgrsString(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  const cleanedCoord = code.replace(WHITESPACE_REGEX, '');
  return MGRS_REGEX.test(cleanedCoord);
}

/**
 * Parses latitude and longitude from a comma-separated string
 * Format: "40.7128,-74.0060" or "40.7128 , -74.0060"
 * Latitude range: -90 to 90 | Longitude range: -180 to 180
 * @deprecated Use coordinate-parser library instead
 * @param latLongInput - String in format "latitude,longitude"
 * @returns Object with lat/lon properties, or false if invalid format
 */
export function parseLatLon(
  latLongInput: string,
): { lat: number; lon: number } | false {
  if (!latLongInput || typeof latLongInput !== 'string') {
    return false;
  }

  const cleanedInput = latLongInput.replace(WHITESPACE_REGEX, '');

  if (!LAT_LON_REGEX.test(cleanedInput)) {
    return false;
  }

  const [latStr, lonStr] = cleanedInput.split(',');
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return false;
  }

  return { lat, lon };
}
