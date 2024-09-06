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

export function parseGeoLocation(code: string): any {
  if (isPlusCode(code)) {
    const coord = OpenLocationCode.decode(code);
    const lat = Number(coord.latitudeLo.toFixed(7)); // latitudeCenter.toFixed(7));
    const lng = Number(coord.longitudeLo.toFixed(7));
    return { lat, lng };
  }
  if (isMgrsString(code)) {
    try {
      const [lng, lat] = mgrs.toPoint(code);
      return { lat, lng };
    } catch (e) {
      console.log('parseGeoLocation', e);
    }
  }
  return undefined;
}

export function isGeoTag(code: string): boolean {
  return isPlusCode(code) || isMgrsString(code);
}

/** Returns true is a string is plus code e.g. 8FWH4HVG+3V 8FWH4HVG+ 8FWH4H+ */
export function isPlusCode(plusCode: string): boolean {
  if (!plusCode) {
    return false;
  }
  const upperCasedPlusCode = plusCode.toUpperCase(); // needed only lowercased index
  return /(^|\s)([23456789C][23456789CFGHJMPQRV][23456789CFGHJMPQRVWX]{6}\+[23456789CFGHJMPQRVWX]{2,3})(\s|$)/.test(
    upperCasedPlusCode,
  );
}

/** Returns true is a string is MGRS code e.g. 18SUJ7082315291 18SUJ70821529 18SUJ708152 */
export function isMgrsString(c) {
  if (!c) {
    return false;
  }
  const coord = c.replace(/\s+/g, '');
  const MGRS =
    /^(\d{1,2})([C-HJ-NP-X])\s*([A-HJ-NP-Z])([A-HJ-NP-V])\s*(\d{1,5}\s*\d{1,5})$/i;
  return MGRS.test(coord);
}

/**
 * @deprecated use coordinate-parser lib instead
 * @param latLongInput
 */
export function parseLatLon(
  latLongInput: string,
): { lat: number; lon: number } | false {
  const cleanedInput = latLongInput.replace(/\s+/g, ''); // cleaning spaces
  if (
    !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(
      cleanedInput,
    )
  ) {
    return false;
  }
  const latLongArray = cleanedInput.split(',');
  const lat = parseFloat(latLongArray[0]);
  const lon = parseFloat(latLongArray[1]);
  if (!isNaN(lat) && !isNaN(lon)) {
    return {
      lat,
      lon,
    };
  }
  return false;
}
