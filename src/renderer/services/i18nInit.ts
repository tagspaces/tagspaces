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

import i18n from 'i18next';
import i18nOptions from './i18nOptions';
import HttpBackend, { HttpBackendOptions } from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';

const initI18n = async (lng = undefined) => {
  await i18n
    //.use(LanguageDetector)
    .use(initReactI18next)
    .use(HttpBackend)
    .init<HttpBackendOptions>({ ...i18nOptions, ...(lng && { lng: lng }) });

  return i18n;
};
/*function init(): Promise<boolean> {
  if (!i18n.isInitialized) {
    return new Promise((resolve, reject) =>
      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .use(HttpBackend)
        .init<HttpBackendOptions>(i18nOptions, (err, t) => {
          // i18n.use(XHR).init(options, (err, t) => {
          if (err) {
            reject(false);
            return console.log('something went wrong loading', err);
          }
          resolve(true);
        })
    );
  } else {
    return Promise.resolve(true);
  }
}*/

export default initI18n;
