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

import AppConfig from '-/AppConfig';

let tsPro;

try {
  tsPro = require('node_modules/@tagspacespro/tagspacespro');
} catch (e) {
  if (e && e.code && e.code === 'MODULE_NOT_FOUND') {
    console.log('PRO functionality not available');
  } else {
    throw e;
  }
}

if (AppConfig.isCordovaAndroid) {
  tsPro = undefined;
}

export { tsPro as Pro };
