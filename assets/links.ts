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

const urlParams = '?utm_source=app';

const Links = {
  links: {
    checkNewVersionURL: 'https://updates.tagspaces.org/releases/',
    productsOverview: 'https://www.tagspaces.org/products/' + urlParams,
    productProObjectStore:
      'https://www.tagspaces.org/products/pro/#connectingObjectStorage' +
      urlParams,
    productProAdvancedSearch:
      'https://www.tagspaces.org/products/pro/#advancedSearch' + urlParams,
    productProFileFolderMeta:
      'https://www.tagspaces.org/products/pro/#fileFolderMeta' + urlParams,
    productProThumbnailsGeneration:
      'https://www.tagspaces.org/products/pro/#thumbnailsGeneration' +
      urlParams,
    productProFolderColor:
      'https://docs.tagspaces.org/annotations/#custom-folder-colors' +
      urlParams,
    productProGeoTagging: 'https://www.tagspaces.org/usecases/geotagging/',
    productPro: 'https://www.tagspaces.org/products/pro/' + urlParams,
    productEnterprise:
      'https://www.tagspaces.org/products/enterprise/' + urlParams,
    downloadURL: 'https://www.tagspaces.org/downloads/' + urlParams,
    howToStart: 'https://www.tagspaces.org/products/howtostart/' + urlParams,
    changelogURL: 'https://www.tagspaces.org/whatsnew/' + urlParams,
    imprintURL: 'https://www.tagspaces.org/about/imprint/' + urlParams,
    privacyURL: 'https://www.tagspaces.org/legal/privacy-app/' + urlParams,
    suggestFeature: 'https://tagspaces.discourse.group/c/feature-requests/6',
    forumsUrl: 'https://tagspaces.discourse.group',
    reportIssue: 'https://github.com/tagspaces/tagspaces/issues/',
    helpTranslating: 'https://www.transifex.com/tagspaces/tagspaces/',
    webClipperChrome:
      'https://chrome.google.com/webstore/detail/tagspaces-web-clipper/ldalmgifdlgpiiadeccbcjojljeanhjk',
    webClipperFirefox:
      'https://addons.mozilla.org/en-US/firefox/addon/tagspaces/',
    webClipper: 'https://www.tagspaces.org/products/webclipper/' + urlParams,
    twitter: 'https://x.com/tagspaces',
    mastodon: 'https://fosstodon.org/@tagspaces',
    emailContact: 'mailto:contactus@tagspaces.org?subject=App',
    cancelSubscription:
      'mailto:contactus@tagspaces.org?subject=Cancel%20subscription&body=Please%20enter%20here%20you%20order%20ID%20or%20the%20email%20with%20which%20the%20purchase%20was%20made.', // 'https://fastspring.com/consumer-support-form/?ulCase.Primary_Category__c=Cancel%20/%20Refund&Case.Category__c=Cancel%20Subscription'
  },
  documentationLinks: {
    general: 'https://docs.tagspaces.org/' + urlParams,
    perspectives: 'https://docs.tagspaces.org/browsing-files' + urlParams,
    defaultPerspective:
      'https://docs.tagspaces.org/perspectives/grid' + urlParams,
    mapiquePerspective:
      'https://docs.tagspaces.org/perspectives/mapique' + urlParams,
    foldervizPerspective:
      'https://docs.tagspaces.org/perspectives/folderviz' + urlParams,
    galleryPerspective:
      'https://docs.tagspaces.org/perspectives/gallery' + urlParams,
    kanbanPerspective:
      'https://docs.tagspaces.org/perspectives/kanban' + urlParams,
    locations: 'https://docs.tagspaces.org/ui/locations' + urlParams,
    revisions:
      'https://docs.tagspaces.org/editing-files#file-revisions' + urlParams,
    taglibrary: 'https://docs.tagspaces.org/ui/taglibrary' + urlParams,
    search: 'https://docs.tagspaces.org/search' + urlParams,
    settings: 'https://docs.tagspaces.org/ui/settings' + urlParams,
    sharing: 'https://docs.tagspaces.org/sharing' + urlParams,
    creatingFiles: 'https://docs.tagspaces.org/creating-files' + urlParams,
  },
};

export default Links;
