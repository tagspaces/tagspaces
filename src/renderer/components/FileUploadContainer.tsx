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

import React, { forwardRef, Ref, useImperativeHandle, useRef } from 'react';
import { Progress } from 'aws-sdk/clients/s3';
import { TS } from '-/tagspaces.namespace';

interface Props {
  directoryPath: string;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  toggleUploadDialog: () => void;
  toggleProgressDialog: () => void;
  resetProgress: () => void;
}

export interface FileUploadContainerRef {
  onFileUpload: () => void;
}

const FileUploadContainer = forwardRef(
  (props: Props, ref: Ref<FileUploadContainerRef>) => {
    useImperativeHandle(ref, () => ({
      onFileUpload() {
        /* if (AppConfig.isCordovaAndroid) {
          PlatformIO.selectFileDialog()
            .then(file => {
              console.log('file', file.uri);
              return [file.uri];
            })
            .then(arrFiles => {
              props
                .uploadFiles(
                  arrFiles,
                  props.directoryPath,
                  props.onUploadProgress
                )
                .then(fsEntries => {
                  props.reflectCreateEntries(fsEntries);
                  return true;
                })
                .catch(error => {
                  console.log('uploadFiles', error);
                });
              props.toggleUploadDialog();
              return true;
            })
            .catch(error => {
              console.log('uploadFiles', error);
            });
        } else { */
        fileInput.current.click();
        // }
      }
    }));

    /* if (AppConfig.isCordovaAndroid) {
      return null;
    } */

    const fileInput = useRef<HTMLInputElement>(null);

    function handleFileInputChange(selection: any) {
      // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
      // const file = selection.currentTarget.files[0];
      props.resetProgress();

      props
        .uploadFilesAPI(
          Array.from(selection.currentTarget.files),
          props.directoryPath,
          props.onUploadProgress
        )
        .then(fsEntries => {
          props.reflectCreateEntries(fsEntries);
          return true;
        })
        .catch(error => {
          console.log('uploadFiles', error);
        });
      props.toggleUploadDialog();
    }

    return (
      <input
        style={{ display: 'none' }}
        ref={fileInput}
        accept="*"
        type="file"
        multiple
        onChange={handleFileInputChange}
      />
    );
  }
);

/* function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleProgressDialog: AppActions.toggleProgressDialog,
      resetProgress: AppActions.resetProgress,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      uploadFiles: IOActions.uploadFiles
    },
    dispatch
  );
} */

export default FileUploadContainer;
