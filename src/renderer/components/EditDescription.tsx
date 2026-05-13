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
import { MilkdownProvider } from '@milkdown/react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useRef } from 'react';

function EditDescription() {
  const theme = useTheme();
  const { setEditDescriptionMode, setDescription } = useFilePropertiesContext();

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

  const insertMarkdown = (markdown: string) => {
    const ref = fileDescriptionRef.current;
    if (!ref) return;
    ref.insert(markdown);
    // The Crepe `markdownUpdated` listener in DescriptionMdEditor.tsx is
    // gated on `view.hasFocus()` to avoid firing on programmatic updates,
    // which means our insert here would otherwise be silently skipped and
    // the description wouldn't be marked dirty. Push the new markdown into
    // the parent state explicitly so save picks it up.
    const next = ref.getMarkdown();
    if (typeof next === 'string') {
      setDescription(next);
    }
    // Return DOM focus so the caret blinks at the new position and the user
    // can continue typing.
    ref.focus();
  };

  const getSelectedText = () =>
    fileDescriptionRef.current?.getSelectedText() ?? '';

  return (
    <Box
      sx={{
        height: 'calc(100% - 50px)',
      }}
    >
      <EditDescriptionButtons
        resetMdContent={resetMdContent}
        setEditMode={setEditMode}
        insertMarkdown={insertMarkdown}
        getSelectedText={getSelectedText}
      />
      <Box
        ref={milkdownDivRef}
        className="descriptionEditor"
        data-tid="descriptionTID"
        onDoubleClick={() => {
          setEditDescriptionMode(true);
          setEditMode(true);
        }}
        sx={{
          border: '1px solid ' + theme.palette.divider,
          borderRadius: AppConfig.defaultCSSRadius,
          background: theme.palette.background.paper,
          height: 'calc(100% - 10px)',
          width: '100%',
          overflowY: 'auto',
        }}
      >
        <style>{`
          .descriptionEditor .milkdown .ProseMirror { padding: 10px 30px 10px 80px; }
          .descriptionEditor .milkdown .ProseMirror a { color: ${theme.palette.primary.main}; }
        `}</style>
        <MilkdownProvider>
          <DescriptionMdEditor ref={fileDescriptionRef} />
        </MilkdownProvider>
      </Box>
    </Box>
  );
}

export default EditDescription;
