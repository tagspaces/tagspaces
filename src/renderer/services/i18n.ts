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
import initI18n from '-/services/i18nInit';

/*i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(HttpBackend);*/

/*.use(initReactI18next) // passes i18n down to react-i18next
  .use(HttpBackend)
  .use(LanguageDetector);*/
if (!i18n.isInitialized) {
  initI18n().then(() => console.log('i18n initialized'));
}

export default i18n;
