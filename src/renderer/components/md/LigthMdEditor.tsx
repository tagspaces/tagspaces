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
import React from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import { createCrepeEditor } from '-/components/md/utils';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Crepe } from '@milkdown/crepe';

interface LightMdEditorProps {
  defaultContent: string;
  placeholder?: string;
}
function LightMdEditor(props: LightMdEditorProps) {
  const { defaultContent, placeholder } = props;

  const { currentDirectoryPath } = useDirectoryContentContext();
  const { openLink } = useOpenedEntryContext();
  useEditor(
    (root) => {
      return createCrepeEditor(
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
        currentDirectoryPath,
        openLink,
      );
    },
    [defaultContent],
  );

  return <Milkdown />;
}

export default LightMdEditor;
