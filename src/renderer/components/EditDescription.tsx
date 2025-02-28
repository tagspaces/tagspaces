/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import EditDescriptionButtons from '-/components/EditDescriptionButtons';
import DescriptionMdEditor from '-/components/md/DescriptionMdEditor';
import { CrepeRef } from '-/components/md/useCrepeHandler';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { Pro } from '-/pro';
import { MilkdownProvider } from '@milkdown/react';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function EditDescription() {
  const { t } = useTranslation();
  const theme = useTheme();
  // const { openedEntry } = useOpenedEntryContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const {
    description,
    setDescription,
    isEditDescriptionMode,
    setEditDescriptionMode,
    isEditMode,
  } = useFilePropertiesContext();

  const milkdownDivRef = useRef<HTMLDivElement>(null);
  const fileDescriptionRef = useRef<CrepeRef>(null);
  //const descriptionFocus = useRef<boolean>(false);
  // const descriptionButtonsRef = useRef(null);

  useEffect(() => {
    return () => {
      fileDescriptionRef.current?.destroy();
    };
  }, []);

  /*const keyBindingHandlers = {
    saveDocument: () => {
      //setEditDescriptionMode(!editMode);
      toggleEditDescriptionField();
    } /!*dispatch(AppActions.openNextFile())*!/
  };*/

  /* const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    [],
  );*/
  const milkdownListener = React.useCallback((markdown: string) => {
    if (markdown !== description) {
      //descriptionFocus.current &&
      setDescription(markdown);
      /*if (descriptionButtonsRef.current) {
        descriptionButtonsRef.current.setDescriptionChanged(true);
      }*/
    }
  }, []);

  //const noDescription = !description || description.length < 1;
  const placeholder = isEditDescriptionMode
    ? undefined
    : t(
        Pro
          ? 'core:addMarkdownDescription'
          : 'core:thisFunctionalityIsAvailableInPro',
      );
  return (
    <div
      style={{
        height: 'calc(100% - 50px)',
      }}
    >
      <EditDescriptionButtons
        getHtml={() => milkdownDivRef.current?.innerHTML}
      />
      <div
        ref={milkdownDivRef}
        className="descriptionEditor"
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (Pro && !isEditDescriptionMode && !isEditMode) {
            setEditDescriptionMode(true);
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          height: '100%',
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <style>
          {`
                .descriptionEditor .milkdown .ProseMirror {
                    padding: 10px 30px 10px 80px;
                }
                .descriptionEditor .prose a {
                    color: ${theme.palette.primary.main};
                }
                .descriptionEditor .prose img {
                    max-width: 99%;
                }
             `}
        </style>
        <MilkdownProvider>
          <DescriptionMdEditor
            ref={fileDescriptionRef}
            defaultContent={description}
            placeholder={placeholder}
            defaultEditMode={isEditDescriptionMode}
            onChange={milkdownListener}
            currentFolder={currentDirectoryPath}
          />
        </MilkdownProvider>
      </div>
    </div>
  );
}

export default EditDescription;
