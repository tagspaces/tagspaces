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
const isCordovaiOS = /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad/i.test(navigator.userAgent);
const isCordovaAndroid = document.URL.indexOf('file:///android_asset') === 0;

export default {
  checkNewVersionURL: 'https://www.tagspaces.org/releases/tagspaces.json',
  downloadURL: 'https://www.tagspaces.org/downloads',
  changelogURL: 'https://www.tagspaces.org/whatsnew',
  tagspacesAppPath: '/tagspaces/',
  metaFolder: '.ts',
  metaFolderFile: 'tsm.json',
  folderIndexFile: 'tsi.json',
  metaFileExt: '.json',
  thumbFileExt: '.jpg',
  thumbType: 'image/jpeg',
  contentFileExt: '.txt',
  beginTagContainer: '[',
  endTagContainer: ']',
  tagDelimiter: ' ',
  prefixTagContainer: '',
  maxThumbSize: 400,
  indexerLimit: 200000,
  // maxSearchResult: 1000,
  defaultFileColor: '#808080',
  defaultFolderColor: '#555', // transparent #FDEEBD #ff791b #2c001e #880e4f
  isElectron: (navigator.userAgent.toLowerCase().indexOf(' electron/') > -1),
  isFirefox: (navigator.userAgent.toLowerCase().includes('firefox')), // typeof InstallTrigger !== 'undefined';
  isWin: navigator.appVersion.includes('Win'),
  isMacLike: navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i),
  isWeb: (document.URL.startsWith('http') && !document.URL.startsWith('http://localhost:1212/')),
  isCordovaiOS,
  isCordovaAndroid,
  isCordova: isCordovaiOS || isCordovaAndroid,
  dirSeparator: (navigator.appVersion.includes('Win') && !document.URL.startsWith('http')) ? '\\' : '/',
};
