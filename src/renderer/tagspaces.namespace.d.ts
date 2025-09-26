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

import { ScopeType } from '-/components/SearchOptions';
import AWS from 'aws-sdk';

export namespace TS {
  interface WorkSpace {
    uuid: string;
    shortName: string;
    fullName: string;
  }
  interface Location {
    uuid: string;
    newuuid?: string;
    name: string;
    workSpaceId?: string;
    type: string; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
    authType?: string; // none,password,digest,token
    username?: string;
    password?: string;
    paths?: Array<string>; // deprecated
    path?: string;
    //children?: Array<any>;
    perspective?: string; // id of the perspective
    creationDate?: number;
    lastEditedDate?: number;
    isDefault: boolean;
    isReadOnly?: boolean;
    isNotEditable?: boolean;
    watchForChanges?: boolean;
    disableIndexing?: boolean;
    reloadOnFocus?: boolean;
    disableThumbnailGeneration?: boolean;
    fullTextIndex?: boolean;
    extractLinks?: boolean;
    maxIndexAge?: number;
    maxLoops?: number;
    persistTagsInSidecarFile?: boolean;
    ignorePatternPaths?: Array<string>;
    autoOpenedFilename?: string;
  }

  interface S3Location extends Location {
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    bucketName?: string;
    region?: string;
    endpointURL?: string;
    encryptionKey?: string;
    s3API?: AWS.S3;
  }

  interface FileExistenceCheck {
    promise: Promise<boolean>;
    path: string;
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
    extensionExternalPath?: string;
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
    dateCreated?: string;
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
  export type ActionSource = 'local' | 'upload' | 'thumbgen' | 'fsWatcher';
  export type FileType = 'txt' | 'md' | 'html' | 'url';

  interface EditAction {
    action: 'add' | 'delete' | 'update' | 'move' | 'edit';
    entry: TS.FileSystemEntry;
    oldEntryPath?: string;
    open?: boolean;
    source?: ActionSource;
    skipSelection?: boolean;
  }

  interface EditMetaAction {
    action:
      | 'perspectiveChange'
      | 'autoSaveChange'
      | 'descriptionChange'
      | 'thumbChange'
      | 'thumbGenerate'
      | 'bgdImgChange'
      | 'bgdColorChange';
    entry?: TS.FileSystemEntry;
  }

  interface PerspectiveActions {
    action: 'openNext' | 'openPrevious' | 'reload';
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
    //path?: string; // needed for geo tagging should be removed
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
    workSpaceId?: string;
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
    isEncrypted?: boolean;
    size: number;
    cdt?: number;
    lmdt: number;
    path: string;
    url?: string;
    meta?: FileSystemEntryMeta;
    links?: Link[];
  }

  interface SearchIndex extends FileSystemEntry {
    fromTime?: number;
    toTime?: number;
    lat?: number;
    lon?: number;
  }

  type LinkType = 'url' | 'email' | 'tslink' | 'hashtag' | 'mention';

  interface Link {
    /**
     * The type of entity found.
     */
    type: LinkType;
    /**
     * Should be the value of this links `href` attribute.
     */
    href: string;
    /**
     * Entry id if link from type tslink and id is available
     * @deprecated
     */
    tseid: string;
    /**
     * The original entity substring.
     */
    value?: string;
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
    lat?: number;
    lng?: number;
  }

  interface OpenedEntry extends FileSystemEntry {
    viewingExtensionPath: string;
    viewingExtensionId: string;
    editingExtensionPath?: string;
    editingExtensionId?: string;
    //editMode?: boolean; // TODO move in FilePropertiesContextProvider
    focused?: boolean; // TODO make it mandatory once support for multiple files is added
  }

  interface BroadcastMessage {
    // unique ID for the tab instance
    uuid: string;
    type: string;
    payload?: any;
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

  type BookmarksContextData = {
    bookmarks: TS.BookmarkItem[];
    setBookmark: (filePath: string, url: string) => void;
    haveBookmark: (filePath: string) => boolean;
    delAllBookmarks: () => void;
    delBookmark: (filePath: string) => void;
  };

  type extractOptions = {
    EXIFGeo?: boolean;
    EXIFDateTime?: boolean;
    IPTCDescription?: boolean;
    IPTCTags?: boolean;
  };

  type ExifExtractionContextData = {
    extractAndSaveContent: (options: extractOptions) => Promise<boolean>;
  };

  type HistoryContextData = {
    fileOpenHistory: TS.HistoryItem[];
    folderOpenHistory: TS.HistoryItem[];
    fileEditHistory: TS.HistoryItem[];
    searchHistory: TS.HistoryItem[];
    saveHistory: (key, historyItem: TS.HistoryItem, limit) => void;
    delAllHistory: (key) => void;
    delHistory: (key, creationTimeStamp) => void;
    //openItem: (item: TS.HistoryItem) => void;
  };

  type KanBanImportDialogContextData = {
    openKanBanImportDialog: () => void;
    closeKanBanImportDialog: () => void;
  };

  type ThumbDialogContextData = {
    openThumbsDialog: (fsEntry: TS.FileSystemEntry) => void;
    closeThumbsDialog: () => void;
  };

  type BgndDialogContextData = {
    openBgndDialog: (fsEntry: TS.FileSystemEntry) => void;
    closeBgndDialog: () => void;
  };

  type AiTemplatesContextData = {
    getTemplate: (key: string) => string;
    getDefaultTemplate: (key: string) => string;
    setTemplate: (key: string, value: string) => void;
  };

  interface FileTemplate {
    id: string;
    content: string; // e.g: Created with TagSpaces on 20250605'
    name?: string;
    description?: string;
    type?: 'md' | 'txt' | 'html';
    fileNameTmpl?: string; // e.g. note, issue, task
    screenshotUrl?: string; //'dataURL'
  }

  type FileTemplatesContextData = {
    getTemplate: (type: string) => FileTemplate | undefined;
    setTemplate: (id: string, value: FileTemplate) => void;
    setTemplateActive: (id: string) => void;
    getTemplates: () => TS.FileTemplate[];
    resetTemplates: () => void;
    delTemplate: (id: string) => void;
  };

  type WorkSpacesContextData = {
    getWorkSpace: (id: string) => WorkSpace | undefined;
    setWorkSpace: (wSpace: WorkSpace) => void;
    delWorkSpace: (id: string) => void;
    getWorkSpaces: () => WorkSpace[];
    setCurrentWorkSpaceId: (wSpaceId: string) => void;
    getCurrentWorkSpace: () => TS.WorkSpace;
    openNewWorkspaceDialog: (workSpace?: TS.WorkSpace) => void;
  };

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
    creationTimeStamp?: number;
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
    settingsKey?: string;
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
    galleryTypeGroup?: string[];
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
