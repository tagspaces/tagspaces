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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import {
  ChangeEvent,
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  id?: string;
  //directoryPath: string;
}

export interface FileUploadContainerRef {
  onFileUpload: (directoryPath: string) => void;
  onMetaUpload: () => void;
  setMetaUpload: (mUpload: () => void) => void;
}

const FileUploadContainer = forwardRef(
  (props: Props, ref: Ref<FileUploadContainerRef>) => {
    const dispatch: AppDispatch = useDispatch();
    const { id } = props;
    const { findLocalLocation } = useCurrentLocationContext();
    //const { openFileUploadDialog } = useFileUploadDialogContext();
    const { uploadFilesAPI, uploadMeta } = useIOActionsContext();
    const { setReflectMetaActions } = useEditedEntryMetaContext();
    const directoryPath = useRef<string>(undefined);
    const metaUpload = useRef<() => void>(undefined);

    const onUploadProgress = (progress, abort, fileName) => {
      dispatch(AppActions.onUploadProgress(progress, abort, fileName));
    };

    useImperativeHandle(ref, () => ({
      onMetaUpload() {
        if (metaUpload.current) {
          metaUpload.current();
        }
      },
      setMetaUpload(mUpload: () => void) {
        metaUpload.current = mUpload;
      },
      onFileUpload(dirPath: string) {
        directoryPath.current = dirPath;
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
      },
    }));

    /* if (AppConfig.isCordovaAndroid) {
      return null;
    } */

    const fileInput = useRef<HTMLInputElement>(null);

    function handleFileInputChange(selection: ChangeEvent<HTMLInputElement>) {
      // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
      // const file = selection.currentTarget.files[0];
      dispatch(AppActions.resetProgress());
      // openFileUploadDialog();
      const localLocation = findLocalLocation();
      const sourceLocationId = localLocation ? localLocation.uuid : undefined;

      let files = Array.from(selection.currentTarget.files);
      if (AppConfig.isElectron) {
        files = files.map((file) => {
          if (!file.path) {
            file.path = window.electronIO.ipcRenderer.getPathForFile(file);
          }
          return file;
        });
      }
      uploadFilesAPI(
        files,
        directoryPath.current,
        onUploadProgress,
        false,
        false,
        undefined,
        sourceLocationId,
      )
        .then((fsEntries: Array<TS.FileSystemEntry>) => {
          const actions: TS.EditMetaAction[] = fsEntries.map((entry) => ({
            action: 'thumbGenerate',
            entry: entry,
          }));
          setReflectMetaActions(...actions);
          return true;
        })
        .catch((error) => {
          console.log('uploadFiles', error);
        });
      metaUpload.current = () =>
        uploadMeta(
          files.map((f) => f.path),
          directoryPath.current,
          onUploadProgress,
          false,
          undefined,
          sourceLocationId,
        );
    }
    const inputId = id || `id-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <input
        id={inputId}
        style={{ display: 'none' }}
        ref={fileInput}
        accept="*"
        type="file"
        multiple
        onChange={handleFileInputChange}
      />
    );
  },
);

export default FileUploadContainer;
