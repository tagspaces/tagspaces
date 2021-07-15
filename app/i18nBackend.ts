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
 */

import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
// import LanguageDetector from 'i18next-browser-languagedetector';

const { join } = require('path');
const { readdirSync, lstatSync } = require('fs');

i18n
  .use(Backend)
  // .use(LanguageDetector)
  .init({
    debug: false,
    initImmediate: false,
    fallbackLng: 'en',
    lng: 'en',
    preload: readdirSync(join(__dirname, 'locales')).filter(fileName => {
      const joinedPath = join(join(__dirname, 'locales'), fileName);
      return lstatSync(joinedPath).isDirectory();
    }),
    ns: 'backend-app',
    defaultNS: 'backend-app',
    backend: {
      loadPath: join(__dirname, 'locales/{{lng}}/core.json')
    }
  });

export default i18n;
