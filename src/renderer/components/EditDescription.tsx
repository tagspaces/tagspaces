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
import AppConfig from '-/AppConfig';
import EditDescriptionButtons from '-/components/EditDescriptionButtons';
import DescriptionMdEditor from '-/components/md/DescriptionMdEditor';
import { CrepeRef } from '-/components/md/useCrepeHandler';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { Pro } from '-/pro';
import { MilkdownProvider } from '@milkdown/react';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useRef } from 'react';

function EditDescription() {
  const theme = useTheme();
  const { setEditDescriptionMode } = useFilePropertiesContext();

  const milkdownDivRef = useRef<HTMLDivElement>(null);
  const fileDescriptionRef = useRef<CrepeRef>(null);

  useEffect(() => {
    return () => {
      fileDescriptionRef.current?.destroy();
    };
  }, []);

  //const noDescription = !description || description.length < 1;
  const resetMdContent = (mdContent: string) => {
    if (!fileDescriptionRef.current) return;
    fileDescriptionRef.current.update(mdContent);
  };

  const setEditMode = (editMode: boolean) => {
    if (!fileDescriptionRef.current) return;
    fileDescriptionRef.current.setEditMode(editMode);
  };

  return (
    <div
      style={{
        height: 'calc(100% - 50px)',
      }}
    >
      <EditDescriptionButtons
        getHtml={() => milkdownDivRef.current?.innerHTML}
        resetMdContent={resetMdContent}
        setEditMode={setEditMode}
      />
      <div
        ref={milkdownDivRef}
        className="descriptionEditor"
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (Pro) {
            setEditDescriptionMode(true);
            setEditMode(true);
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: AppConfig.defaultCSSRadius,
          height: 'calc(100% - 20px)',
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <style>
          {`.descriptionEditor .milkdown .ProseMirror {
              padding: 10px 30px 10px 80px;
          }
          .descriptionEditor .prose a {
              color: ${theme.palette.primary.main};
          }
          .descriptionEditor .prose img {
              max-width: 99%;
          }`}
        </style>
        <MilkdownProvider>
          <DescriptionMdEditor ref={fileDescriptionRef} />
        </MilkdownProvider>
      </div>
    </div>
  );
}

export default EditDescription;
