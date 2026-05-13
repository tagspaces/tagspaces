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
import { createCrepeEditor } from '-/components/md/utils';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Crepe } from '@milkdown/crepe';
import { EditorStatus } from '@milkdown/kit/core';
import { getMarkdown, replaceAll } from '@milkdown/kit/utils';
import { Milkdown, useEditor } from '@milkdown/react';
import { useEffect, useRef } from 'react';

interface LightMdEditorProps {
  defaultContent: string;
  placeholder?: string;
}
function LightMdEditor(props: LightMdEditorProps) {
  const { defaultContent, placeholder } = props;

  const { currentDirectory } = useDirectoryContentContext();
  const { currentLocation } = useCurrentLocationContext();
  const { openLink } = useOpenedEntryContext();
  const crepeRef = useRef<Crepe | null>(null);

  const { get, loading } = useEditor(
    (root) => {
      const crepe = createCrepeEditor(
        root,
        defaultContent,
        false,
        {
          [Crepe.Feature.BlockEdit]: false,
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.Placeholder]: false,
          [Crepe.Feature.Cursor]: false,
        },
        placeholder,
        currentDirectory?.path,
        openLink,
        undefined,
        undefined,
        currentLocation?.uuid,
      );
      crepe.editor.onStatusChange((status: EditorStatus) => {
        if (status === EditorStatus.Created) {
          crepeRef.current = crepe;
        }
      });
      return crepe;
    },
    // Recreate the editor only when the link resolution context changes —
    // location id, current folder path, or readonly options. Content updates
    // are handled imperatively in the effect below so the editor instance is
    // stable across folder switches.
    [currentDirectory?.path, currentLocation?.uuid],
  );

  // Imperatively push new defaultContent into the editor when it changes
  // (e.g. user navigates to a different folder, or directoryMeta finishes
  // loading after the editor mounted).
  useEffect(() => {
    const editor = get();
    if (
      loading ||
      !editor ||
      editor.status !== EditorStatus.Created ||
      !crepeRef.current
    ) {
      return;
    }
    try {
      const currentMd = editor.action(getMarkdown());
      if (currentMd !== defaultContent) {
        editor.action(replaceAll(defaultContent || '', true));
      }
    } catch (e) {
      // Editor may not be fully ready; ignore.
    }
  }, [defaultContent, get, loading]);

  return <Milkdown />;
}

export default LightMdEditor;
