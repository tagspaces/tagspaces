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
import { InitOptions } from 'i18next';
import en from '../locales/en/core.json';
import enUs from '../locales/en_US/core.json';

let defaultLanguage: any = enUs;
if (
  typeof process !== 'undefined' &&
  process.env &&
  process.env.NODE_ENV &&
  process.env.NODE_ENV === 'development'
) {
  defaultLanguage = en;
}

async function loadLocales(options, url: string, payload, callback) {
  try {
    const locale = await import('../locales/' + url + '/core.json');
    callback(null, { status: 200, data: locale });
  } catch (e) {
    console.log(`Unable to load locale at ${url}\n`, e);
    callback(null, { status: 200, data: defaultLanguage });
  }
}

// @ts-ignore
const options: InitOptions = {
  debug: false,
  returnNull: false,
  fallbackLng: 'en',
  // load: 'all', // ['en', 'de'], // we only provide en, de -> no region specific locals like en-US, de-DE
  ns: ['core'],
  defaultNS: 'core',
  // attributes: ['t', 'i18n'],
  keySeparator: false,
  backend: {
    loadPath: '{{lng}}',
    // parse: data => data, // comment to have working i18n switch
    request: loadLocales, // comment to have working i18n switch
  }, // as HttpBackendOptions
  // getAsync: true,
  // debug: true,
  /* interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
    format: (value, format) => {
      if (format === 'uppercase') return value.toUpperCase();
      return value;
    }
  } */
};

export default options;
