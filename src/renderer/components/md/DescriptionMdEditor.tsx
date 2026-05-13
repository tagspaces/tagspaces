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
import { Crepe } from '@milkdown/crepe';
import { EditorStatus, commandsCtx } from '@milkdown/kit/core';
import { $command, $useKeymap, getMarkdown } from '@milkdown/kit/utils';
import { Milkdown, useEditor } from '@milkdown/react';
import { replaceAll } from '@milkdown/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import AppConfig from '-/AppConfig';

import { CrepeRef, useCrepeHandler } from '-/components/md/useCrepeHandler';
import { createCrepeEditor } from '-/components/md/utils';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import useFirstRender from '-/utils/useFirstRender';
import { useTranslation } from 'react-i18next';

interface CrepeMdEditorProps {
  //onChange?: (markdown: string, prevMarkdown: string) => void;
  onFocus?: () => void;
}

const DescriptionMdEditor = forwardRef<CrepeRef, CrepeMdEditorProps>(
  (props, ref) => {
    const { onFocus } = props;
    const { t } = useTranslation();
    const { currentDirectory } = useDirectoryContentContext();
    const { findLocation } = useCurrentLocationContext();
    const { metaActions } = useEditedEntryMetaContext();
    const {
      saveDescription,
      isEditDescriptionMode,
      isDescriptionChanged,
      description,
      setDescription,
    } = useFilePropertiesContext();
    const { openedEntry, openLink } = useOpenedEntryContext();

    // We'll keep a ref to the “Crepe” wrapper (returned by createCrepeEditor):
    const crepeRef = useRef<Crepe>(null);
    const firstRender = useFirstRender();
    const [ctxMenu, setCtxMenu] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const ctxFocusRef = useRef<{ el: HTMLElement | null; range: Range | null }>(
      { el: null, range: null },
    );
    const isMac = AppConfig.isMacLike;
    const mod = isMac ? '\u2318' : 'Ctrl+';

    // Base folder for resolving relative markdown links. For a file's
    // description the base is the file's containing folder; for a folder's
    // description the base is the folder itself (the description "lives in"
    // the folder). Falls back to currentDirectory if the entry path isn't
    // available yet.
    const linkBaseFolder = (() => {
      if (openedEntry?.path) {
        if (!openedEntry.isFile) {
          return openedEntry.path;
        }
        const loc = findLocation(openedEntry.locationID);
        const sep = loc?.getDirSeparator?.() || '/';
        return extractContainingDirectoryPath(openedEntry.path, sep);
      }
      return currentDirectory?.path;
    })();

    const { get, loading } = useEditor(
      (root) => {
        // Build a Milkdown‐based “Crepe” editor:
        const placeholder = isEditDescriptionMode
          ? undefined
          : t('core:addMarkdownDescription');
        const crepe = createCrepeEditor(
          root,
          description,
          isEditDescriptionMode,
          {},
          placeholder,
          linkBaseFolder,
          openLink,
          (newMd: string) => {
            setDescription(newMd);
          },
          onFocus,
          openedEntry?.locationID,
        );

        // Listen for status changes:
        crepe.editor.onStatusChange((status: EditorStatus) => {
          if (status === EditorStatus.Created) {
            // Now “editorView” has been injected. We can safely do replaceAll here
            crepeRef.current = crepe;
          }
        });

        // Register custom save‐shortcut:
        const saveCommand = $command('saveCommand', () => () => {
          return () => {
            saveDescription();
            return true;
          };
        });

        const saveKeyMap = $useKeymap('saveKeymap', {
          saveDescription: {
            //https://prosemirror.net/docs/ref/version/0.18.0.html#keymap
            shortcuts: 'Mod-s', //keyBindings['saveDocument'], //You can use Mod- as a shorthand for Cmd- on Mac and Ctrl- on other platforms.
            command: (ctx) => {
              const commands = ctx.get(commandsCtx);
              return () => commands.call(saveCommand.key);
            },
          },
        });

        crepe.editor.use([saveCommand, saveKeyMap].flat());

        return crepe;
      },
      [linkBaseFolder],
    );

    // Whenever openedEntry changes and the user hasn't manually edited,
    // we “push” the new description into the editor.
    useEffect(() => {
      if (!isDescriptionChanged) {
        pushNewDescription(openedEntry.meta?.description ?? '');
      }
    }, [openedEntry]); //, isDescriptionChanged]);

    useEffect(() => {
      const crepe = crepeRef.current;
      if (!loading && crepe && crepe.editor.status === EditorStatus.Created) {
        // Double‐check that the current editor content differs:
        try {
          crepe.setReadonly(!isEditDescriptionMode);
        } catch (e) {
          console.error('Failed to setReadonly:', e);
        }
      }
    }, [isEditDescriptionMode]);

    // If some external “metaActions” say “hey, description was updated,”
    // we re‐push it:
    useEffect(() => {
      if (!firstRender && metaActions && metaActions.length > 0) {
        for (const action of metaActions) {
          if (
            action.entry &&
            openedEntry.path === action.entry.path &&
            action.action === 'descriptionChange'
          ) {
            pushNewDescription(action.entry.meta?.description ?? '');
          }
        }
      }
    }, [metaActions]);

    function pushNewDescription(newMd: string) {
      // Grab the Crepe wrapper from ref (only after status === Ready!)
      const crepe = crepeRef.current;
      if (!loading && crepe && crepe.editor.status === EditorStatus.Created) {
        // Double‐check that the current editor content differs:
        try {
          const currentMd = crepe.editor.action(getMarkdown());
          if (currentMd !== newMd) {
            // Now we are guaranteed “editorView” is injected, so replaceAll won't complain:
            crepe.editor.action(replaceAll(newMd, true));
          }
        } catch (e) {
          console.error('Failed to replaceAll:', e);
        }
      }
    }

    // Hook up the external ref to our Crepe instance so parent callers can access it
    useCrepeHandler(ref, () => crepeRef.current, get, loading);

    // Context menu for Electron
    useEffect(() => {
      if (!AppConfig.isElectron) return;
      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        ctxFocusRef.current = {
          el: document.activeElement as HTMLElement | null,
          range: (() => {
            const sel = window.getSelection();
            return sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
          })(),
        };
        setCtxMenu({ top: e.clientY, left: e.clientX });
      };
      document.addEventListener('contextmenu', onContextMenu);
      return () => document.removeEventListener('contextmenu', onContextMenu);
    }, []);

    const execCtxCmd = (cmd: string) => {
      const { el, range } = ctxFocusRef.current;
      setCtxMenu(null);
      el?.focus();
      if (range) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      if (cmd === 'paste') {
        // execCommand('paste') is blocked in Electron; read clipboard manually and
        // dispatch a ClipboardEvent so ProseMirror's own paste handler processes it.
        navigator.clipboard.readText().then((text) => {
          const dt = new DataTransfer();
          dt.setData('text/plain', text);
          const target = (document.activeElement ?? el) as HTMLElement | null;
          target?.dispatchEvent(
            new ClipboardEvent('paste', {
              bubbles: true,
              cancelable: true,
              clipboardData: dt,
            }),
          );
        });
      } else {
        // @ts-ignore -- execCommand is deprecated but required to trigger ProseMirror's clipboard event handlers
        document.execCommand(cmd);
      }
    };

    const ctxItems = [
      { label: t('core:cut'), shortcut: mod + 'X', cmd: 'cut' },
      { label: t('core:copy'), shortcut: mod + 'C', cmd: 'copy' },
      { label: t('core:paste'), shortcut: mod + 'V', cmd: 'paste' },
      { label: t('core:selectAll'), shortcut: mod + 'A', cmd: 'selectAll' },
    ];

    return (
      <>
        <Milkdown />
        {AppConfig.isElectron && (
          <Menu
            open={ctxMenu !== null}
            onClose={() => setCtxMenu(null)}
            anchorReference="anchorPosition"
            anchorPosition={ctxMenu ?? undefined}
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
          >
            {ctxItems.map(({ label, shortcut, cmd }) => (
              <MenuItem
                key={cmd}
                dense
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCtxCmd(cmd)}
              >
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {label}
                </Typography>
                <Typography variant="caption" sx={{ ml: 3, opacity: 0.5 }}>
                  {shortcut}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        )}
      </>
    );
  },
);

export default DescriptionMdEditor;
