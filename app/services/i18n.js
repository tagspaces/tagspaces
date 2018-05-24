/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
 * @flow
 */

import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// import de from '../locales/de/core.json';
// import en from '../locales/en/core.json';

function loadLocales(url, options, callback, data) {
  try {
    /* switch (url) {
      case 'locales/de/core.json': {
        callback(de, { status: '200' });
      }
      case 'locales/en/core.json': {
        callback(en, { status: '200' });
      }
      default: {
        callback(de, { status: '200' });
      }
    } */
    const waitForLocale = require('bundle-loader!../locales/' + url + '/core.json');
    waitForLocale((locale) => {
      callback(locale, { status: '200' });
    });
  } catch (e) {
    callback(null, { status: '404' });
  }
}

const options = {
  fallbackLng: 'en',
  // load: 'all', // ['en', 'de'], // we only provide en, de -> no region specific locals like en-US, de-DE
  // ns: ['core'],
  // defaultNS: 'core',
  attributes: ['t', 'i18n'],
  backend: {
    loadPath: '{{lng}}',
    parse: (data) => data, // comment to have working i18n switch
    ajax: loadLocales // comment to have working i18n switch
  },
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

i18n.use(XHR).use(LanguageDetector).init(options, (err, t) => {
// i18n.use(XHR).init(options, (err, t) => {
  if (err) {
    return console.log('something went wrong loading', err);
  }
  // console.log('Test i18next: ' + t('core:name')); // -> same as i18next.t
});

export default i18n;
