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

export namespace TS {
  interface Location {
    uuid: string;
    newuuid?: string;
    name: string;
    type: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    bucketName?: string;
    region?: string;
    paths?: Array<string>; // deprecated
    path?: string;
    endpointURL?: string;
    children?: Array<any>;
    perspective?: string; // id of the perspective
    creationDate?: string;
    isDefault: boolean;
    isReadOnly?: boolean;
    isNotEditable?: boolean;
    watchForChanges?: boolean;
    persistIndex?: boolean;
    fullTextIndex?: boolean;
    maxIndexAge?: number;
    persistTagsInSidecarFile?: boolean;
    ignorePatternPaths?: Array<string>;
  }

  interface SearchQuery {
    uuid?: string; // for saved searches
    title?: string; // for saved searches
    // creationDate?: number; // for saved searches TODO rethink if this needed ?
    textQuery?: string;
    fileTypes?: Array<string>;
    tagsAND?: Array<Tag>;
    tagsOR?: Array<Tag>;
    tagsNOT?: Array<Tag>;
    lastModified?: string;
    fileSize?: string;
    searchBoxing?: 'location' | 'folder' | 'global';
    searchType?: 'fussy' | 'semistrict' | 'strict';
    forceIndexing?: boolean;
    currentDirectory?: string;
    tagTimePeriodFrom?: number | null;
    tagTimePeriodTo?: number | null;
    tagPlaceLat?: number | null;
    tagPlaceLong?: number | null;
    tagPlaceRadius?: number | null;
    maxSearchResults?: number;
    showUnixHiddenEntries?: boolean;
  }

  type Uuid = string;

  interface Tag {
    title?: string;
    type?: 'plain' | 'sidecar' | 'smart'; // smart should be eventually removed from this list, functionality should be enough
    id?: Uuid;
    icon?: string;
    description?: string;
    style?: string;
    path?: string; // needed for geo tagging should be removed
    modified_date?: number;
    functionality?: string;
    keyBinding?: string;
    color?: string;
    textcolor?: string;
    originTitle?: string;
    position?: number;
  }

  interface TagGroup {
    uuid: Uuid;
    title: string;
    locationId?: Uuid;
    expanded?: boolean;
    description?: string;
    categoryId?: string;
    readOnly?: boolean;
    color?: string;
    textcolor?: string;
    children?: Array<Tag>;
    created_date?: number;
    modified_date?: number;
  }

  interface FileSystemEntry {
    uuid?: string;
    name: string;
    isFile: boolean;
    isNewFile?: boolean;
    extension: string;
    thumbPath?: string;
    color?: string;
    perspective?: string;
    textContent?: string;
    description?: string;
    tags: Array<TS.Tag>;
    size: number;
    lmdt: number;
    path: string;
    url?: string;
    meta?: FileSystemEntryMeta;
    isIgnored?: boolean;
  }

  interface FileSystemEntryMeta {
    id?: string;
    description?: string;
    tags?: Array<TS.Tag>;
    tagGroups?: Array<TS.TagGroup>;
    color?: string;
    perspective?: string;
    appName: string;
    appVersion: string;
    lastUpdated: string;
    files?: Array<FileSystemEntry>;
    dirs?: Array<FileSystemEntry>;
  }

  interface MapTileServer {
    uuid: string;
    name: string;
    serverURL: string;
    serverInfo: string;
  }
}
