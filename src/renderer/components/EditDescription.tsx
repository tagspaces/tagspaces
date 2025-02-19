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
import CrepeMdEditor from '-/components/md/CrepeMdEditor';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { Pro } from '-/pro';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import React, { useRef } from 'react';
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

  //const fileDescriptionRef = useRef<MilkdownRef>(null);
  const descriptionFocus = useRef<boolean>(false);
  // const descriptionButtonsRef = useRef(null);

  /*useEffect(() => {
    fileDescriptionRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);*/

  /*const keyBindingHandlers = {
    saveDocument: () => {
      //setEditDescriptionMode(!editMode);
      toggleEditDescriptionField();
    } /!*dispatch(AppActions.openNextFile())*!/
  };*/

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    [],
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== description) {
      setDescription(markdown);
      /*if (descriptionButtonsRef.current) {
        descriptionButtonsRef.current.setDescriptionChanged(true);
      }*/
    }
  }, []);

  const noDescription = !description || description.length < 1;
  return (
    <div
      style={{
        height: 'calc(100% - 50px)',
      }}
    >
      <EditDescriptionButtons />
      <div
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
        {noDescription && !isEditDescriptionMode ? (
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.primary,
              padding: 10,
              lineHeight: 4,
            }}
          >
            {t(
              Pro
                ? 'core:addMarkdownDescription'
                : 'core:thisFunctionalityIsAvailableInPro',
            )}
          </Typography>
        ) : (
          <>
            <style>
              {`
                .milkdown .ProseMirror {
                    padding: 10px 30px 10px 80px;
                }
                .prose a {
                    color: ${theme.palette.primary.main};
                }
                .prose img {
                    max-width: 99%;
                }
             `}
            </style>
            <CrepeMdEditor
              content={description}
              isEditMode={isEditDescriptionMode}
              onChange={milkdownListener}
              onFocus={milkdownOnFocus}
            />
          </>
        )}
      </div>
      {/* <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
      <Typography
          variant="caption"
          style={{
            color: theme.palette.text.primary,
          }}
        >
          Markdown help: <i className={classes.mdHelpers}>_italic_</i>{' '}
          <b className={classes.mdHelpers}>**bold**</b>{' '}
          <span className={classes.mdHelpers}>* list item</span>{' '}
          <span className={classes.mdHelpers}>[Link text](http://...)</span>
        </Typography>
      </span> */}
    </div>
  );
}

export default EditDescription;
