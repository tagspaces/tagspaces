// import AWS from "aws-sdk";
import { locationType } from '@tagspaces/tagspaces-common/misc';
import * as objectStoreAPI from '@tagspaces/tagspaces-common-aws';
import { TS } from '-/tagspaces.namespace';

export class CommonLocation implements TS.Location {
  uuid: string;
  newuuid?: string;
  name: string;
  type: string; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
  authType?: string; // none,password,digest,token
  username?: string;
  password?: string;
  paths?: Array<string>; // deprecated
  path?: string;
  children?: Array<any>; // this is for tree -> getDirectoriesTree
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
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  bucketName?: string;
  region?: string;
  endpointURL?: string;
  ioAPI?: any; //AWS.S3;
  webDavAPI?: any;

  constructor(location: TS.Location) {
    this.uuid = location.uuid;
    this.newuuid = location.newuuid;
    this.name = location.name;
    this.type = location.type; // 0 - local; 1 - S3; 2 - amplify; 3 - webdav
    this.authType = location.authType; // none,password,digest,token
    this.username = location.username;
    this.password = location.password;
    //this.paths = location.paths; // deprecated
    this.path = location.path;
    //children?: Array<any>;
    this.perspective = location.perspective; // id of the perspective
    this.creationDate = location.creationDate;
    this.isDefault = location.isDefault;
    this.isReadOnly = location.isReadOnly;
    this.isNotEditable = location.isNotEditable;
    this.watchForChanges = location.watchForChanges;
    this.disableIndexing = location.disableIndexing;
    this.disableThumbnailGeneration = location.disableThumbnailGeneration;
    this.fullTextIndex = location.fullTextIndex;
    this.maxIndexAge = location.maxIndexAge;
    this.maxLoops = location.maxLoops;
    this.persistTagsInSidecarFile = location.persistTagsInSidecarFile;
    this.ignorePatternPaths = location.ignorePatternPaths;
    if (location.type === locationType.TYPE_CLOUD) {
      this.accessKeyId = (location as TS.S3Location).accessKeyId;
      this.secretAccessKey = (location as TS.S3Location).secretAccessKey;
      this.sessionToken = (location as TS.S3Location).sessionToken;
      this.bucketName = (location as TS.S3Location).bucketName;
      this.region = (location as TS.S3Location).region;
      this.endpointURL = (location as TS.S3Location).endpointURL;
      this.ioAPI = objectStoreAPI.getS3Api(location);
    } else if (location.type === locationType.TYPE_WEBDAV) {
      // TODO impl
    }
  }
}
