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
const isCordovaiOS =
  /^file:\/{3}[^\/]/i.test(window.location.href) &&
  /ios|iphone|ipod|ipad/i.test(navigator.userAgent);
const isCordovaAndroid = document.URL.indexOf('file:///android_asset') === 0;
const iOSMatcher = navigator.userAgent.match(/(iPad|iPhone|iPod)/i);
const isIOS = iOSMatcher && iOSMatcher.length > 0;
const isAndroid = navigator.userAgent.toLowerCase().includes('android');

export const AppConfig = {
  tagspacesAppPath: '/tagspaces/',
  metaFolder: '.ts',
  metaFolderFile: 'tsm.json',
  folderLocationsFile: 'tsl.json',
  folderIndexFile: 'tsi.json',
  folderThumbFile: 'tst.jpg',
  metaFileExt: '.json',
  thumbFileExt: '.jpg',
  thumbType: 'image/jpeg',
  contentFileExt: '.txt',
  beginTagContainer: '[',
  endTagContainer: ']',
  tagDelimiter: ' ',
  prefixTagContainer: '',
  maxCollectedTag: 500,
  maxThumbSize: 400,
  thumbBgColor: '#FFFFFF',
  indexerLimit: 200000,
  maxIndexAge: 10 * 60 * 1000, // 10 minutes
  // maxSearchResult: 1000,
  defaultFileColor: '#808080',
  defaultFolderColor: '#582727', // 555 transparent #FDEEBD #ff791b #2c001e #880e4f
  links: {
    checkNewVersionURL: 'https://www.tagspaces.org/releases/tagspaces.json',
    productsOverview: 'https://www.tagspaces.org/products/',
    productProObjectStore:
      'https://www.tagspaces.org/products/pro/#connectingObjectStores',
    productProAdvancedSearch:
      'https://www.tagspaces.org/products/pro/#advancedSearch',
    productProFileFolderMeta:
      'https://www.tagspaces.org/products/pro/#fileFolderMeta',
    productProThumbnailsGeneration:
      'https://www.tagspaces.org/products/pro/#thumbnailsGeneration',
    productProGeoTagging: 'https://www.tagspaces.org/usecases/geotagging/',
    productPro: 'https://www.tagspaces.org/products/pro/',
    productEnterprise: 'https://www.tagspaces.org/products/enterprise/',
    downloadURL: 'https://www.tagspaces.org/downloads/',
    changelogURL: 'https://www.tagspaces.org/whatsnew/',
    imprintURL: 'https://www.tagspaces.org/about/imprint/',
    privacyURL: 'https://www.tagspaces.org/about/privacy/',
    suggestFeature: 'https://trello.com/b/TGeG5bi9',
    reportIssue: 'https://github.com/tagspaces/tagspaces/issues/',
    helpTranslating: 'https://www.transifex.com/tagspaces/tagspaces/',
    webClipperChrome:
      'https://chrome.google.com/webstore/detail/tagspaces-web-clipper/ldalmgifdlgpiiadeccbcjojljeanhjk',
    webClipperFirefox:
      'https://addons.mozilla.org/en-US/firefox/addon/tagspaces/',
    webClipper: 'https://www.tagspaces.org/products/webclipper/',
    twitter: 'https://twitter.com/tagspaces',
    facebook: 'https://www.facebook.com/tagspacesapp',
    emailContact: 'mailto:contactus@tagspaces.org?subject=App'
  },
  documentationLinks: {
    general: 'https://docs.tagspaces.org/',
    defaultPerspective: 'https://docs.tagspaces.org/perspectives/grid',
    mapiquePerspective: 'https://docs.tagspaces.org/perspectives/mapique',
    treevizPerspective: 'https://docs.tagspaces.org/perspectives/treeviz',
    galleryPerspective: 'https://docs.tagspaces.org/perspectives/gallery',
    locations: 'https://docs.tagspaces.org/ui/locations',
    taglibrary: 'https://docs.tagspaces.org/ui/taglibrary',
    search: 'https://docs.tagspaces.org/search',
    settings: 'https://docs.tagspaces.org/ui/settings'
  },
  isElectron: navigator.userAgent.toLowerCase().indexOf(' electron/') > -1,
  isFirefox: navigator.userAgent.toLowerCase().includes('firefox'), // typeof InstallTrigger !== 'undefined';
  isWin: navigator.appVersion.includes('Win'),
  isMacLike: navigator.userAgent.match(/(Mac|iPhone|iPod|iPad)/i),
  isIOS,
  isAndroid,
  isWeb:
    document.URL.startsWith('http') &&
    !document.URL.startsWith('http://localhost:1212/'),
  isCordovaiOS,
  isCordovaAndroid,
  isCordova: isCordovaiOS || isCordovaAndroid,
  isMobile: isCordovaiOS || isCordovaAndroid || isIOS || isAndroid,
  isAmplify: window.ExtIsAmplify !== undefined ? window.ExtIsAmplify : false,
  saveLocationsInBrowser:
    window.ExtSaveLocationsInBrowser !== undefined
      ? window.ExtSaveLocationsInBrowser
      : false,
  useSidecarsForFileTagging:
    window.ExtUseSidecarsForFileTagging !== undefined
      ? window.ExtUseSidecarsForFileTagging
      : false,
  useSidecarsForFileTaggingDisableSetting:
    window.ExtUseSidecarsForFileTagging !== undefined,
  customLogo: window.ExtLogoURL || false,
  showAdvancedSearch:
    window.ExtShowAdvancedSearch !== undefined
      ? window.ExtShowAdvancedSearch
      : true,
  showSmartTags:
    window.ExtShowSmartTags !== undefined ? window.ExtShowSmartTags : true,
  showWelcomePanel:
    window.ExtShowWelcomePanel !== undefined
      ? window.ExtShowWelcomePanel
      : true,
  locationsReadOnly: window.ExtLocations !== undefined,
  mapTileServers: window.ExtMapTileServers || false,
  sidebarColor: window.ExtSidebarColor || '#2C001E', // '#00D1A1' // #008023
  sidebarSelectionColor: window.ExtSidebarSelectionColor || '#880E4F',
  lightThemeLightColor: window.ExtLightThemeLightColor || '#dcf3ec',
  lightThemeMainColor: window.ExtLightThemeMainColor || '#1dd19f',
  darkThemeLightColor: window.ExtDarkThemeLightColor || '#56454e',
  darkThemeMainColor: window.ExtDarkThemeMainColor || '#ff9abe',
  dirSeparator:
    navigator.appVersion.includes('Win') && !document.URL.startsWith('http')
      ? '\\'
      : '/'
};

export default AppConfig;
