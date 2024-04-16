import { ScopeType } from '-/components/SearchOptions';

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
    type: string; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
    authType?: string; // none,password,digest,token
    username?: string;
    password?: string;
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
    disableIndexing?: boolean;
    disableThumbnailGeneration?: boolean;
    fullTextIndex?: boolean;
    maxIndexAge?: number;
    maxLoops?: number;
    persistTagsInSidecarFile?: boolean;
    ignorePatternPaths?: Array<string>;
  }

  interface Extension {
    extensionId: string;
    extensionName: string;
    extensionTypes: Array<string>;
    extensionExternal?: boolean;
    extensionEnabled: boolean;
    color?: string;
    version: string;
  }

  interface FileTypes {
    id?: string;
    type: string;
    viewer: string;
    editor?: string;
    color?: string;
  }

  interface DirProp {
    totalSize: number;
    filesCount: number;
    dirsCount: number;
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
    searchBoxing?: ScopeType;
    searchType?: 'fuzzy' | 'semistrict' | 'strict';
    forceIndexing?: boolean;
    currentDirectory?: string;
    tagTimePeriodFrom?: number | null;
    tagTimePeriodTo?: number | null;
    tagPlaceLat?: number | null;
    tagPlaceLong?: number | null;
    tagPlaceRadius?: number | null;
    maxSearchResults?: number;
    showUnixHiddenEntries?: boolean;
    executeSearch?: boolean;
  }

  type Uuid = string;

  interface EditAction {
    action: 'add' | 'delete' | 'update' | 'move';
    entry: TS.FileSystemEntry;
    oldEntryPath?: string;
    open?: boolean;
  }

  interface EditMetaAction {
    action:
      | 'perspectiveChange'
      | 'autoSaveChange'
      | 'descriptionChange'
      | 'thumbChange'
      | 'bgdImgChange'
      | 'bgdColorChange';
    entry: TS.FileSystemEntry;
  }

  interface Tag {
    title?: string;
    /**
     * @deprecated type can be auto recognized -> look at editTagForEntry
     */
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
    selected?: boolean;
    created_date?: number;
    modified_date?: number;
  }

  interface FileSystemEntry {
    uuid?: string;
    name: string;
    isFile: boolean;
    isNewFile?: boolean;
    locationID?: string;
    //isAutoSaveEnabled?: boolean; // common with OpenedEntry
    extension?: string;
    textContent?: string;
    tags?: TS.Tag[];
    size: number;
    lmdt: number;
    path: string;
    url?: string;
    meta?: FileSystemEntryMeta;
  }

  interface FileSystemEntryMeta {
    id: string;
    description?: string;
    isFile?: boolean;
    autoSave?: boolean;
    //shouldReload?: boolean;
    tags?: Array<TS.Tag>;
    tagGroups?: Array<TS.TagGroup>;
    thumbPath?: string;
    color?: string;
    perspective?: TS.PerspectiveType;
    appName?: string;
    appVersion?: string;
    lastUpdated?: number;
    customOrder?: CustomOrder;
    perspectiveSettings?: PerspectiveSettings;
  }

  interface OpenedEntry extends FileSystemEntry {
    locationId?: string;
    viewingExtensionPath: string;
    viewingExtensionId: string;
    editingExtensionPath?: string;
    editingExtensionId?: string;
    editMode?: boolean; // TODO move in DescriptionContextProvider
    focused?: boolean; // TODO make it mandatory once support for multiple files is added
  }

  interface CustomOrder {
    folders?: Array<OrderVisibilitySettings>;
    files?: Array<OrderVisibilitySettings>;
  }
  // editTag1Tag2 - prevent edit action react component cache and not reload component if add/remove tags
  type EditedEntryAction =
    | `edit${string}`
    | 'delete'
    | 'rename'
    | 'createFile'
    | 'createDir';

  type EntrySizes = 'huge' | 'big' | 'normal' | 'small' | 'tiny';

  type ThumbnailMode = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  interface EditedEntryPath {
    action: EditedEntryAction;
    path: string;
    uuid?: Uuid;
  }

  /**
   * path: path or title to be shown
   */
  interface HistoryItem {
    path: string;
    url: string;
    lid: string;
    creationTimeStamp: number;
    searchQuery?: TS.SearchQuery;
  }

  interface BookmarkItem {
    path: string;
    url: string;
    creationTimeStamp: number;
  }

  type PerspectiveType =
    | 'grid'
    | 'list'
    | 'gallery'
    | 'mapique'
    | 'kanban'
    | 'unspecified';

  interface PerspectiveSettings {
    grid?: FolderSettings;
    list?: FolderSettings;
    gallery?: FolderSettings;
    mapique?: FolderSettings;
    kanban?: FolderSettings;
    wiki?: FolderSettings;
  }

  interface FolderSettings {
    settingsKey: string;
    showDirectories?: boolean;
    showTags?: boolean;
    showDetails?: boolean;
    showSubFolderDetails?: boolean; // KanBan
    showEntriesDescription?: boolean;
    showDescription?: boolean;
    showFolderContent?: boolean; // KanBan
    // pageLimit?: number; // KanBan
    // pageOffset?: number; // KanBan
    filesLimit?: number; // KanBan
    layoutType?: string;
    orderBy?: boolean;
    sortBy?: string;
    singleClickAction?: string;
    entrySize?: EntrySizes;
    thumbnailMode?: ThumbnailMode;
    gridPageLimit?: number;
    // isLocal?: boolean;
  }

  interface OrderVisibilitySettings {
    uuid: string;
    name: string;
    isCurrent?: boolean;
  }

  interface MapTileServer {
    uuid: string;
    name: string;
    serverURL: string;
    serverInfo: string;
  }
}
