/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import { useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export type KeyBindingHandler = (event: KeyboardEvent) => void;

/**
 * Stored key bindings use the react-hotkeys / Mousetrap vocabulary
 * (`command+a`, `option+d`, `del`). They are persisted in user settings and
 * shown in the UI via `adjustKeyBinding`, so the stored format stays as is and
 * is translated here to the react-hotkeys-hook vocabulary, which matches
 * against `KeyboardEvent.code`.
 */
const keyAliases: Record<string, string> = {
  command: 'meta',
  cmd: 'meta',
  option: 'alt',
  opt: 'alt',
  control: 'ctrl',
  del: 'delete',
  ins: 'insert',
  esc: 'escape',
  return: 'enter',
  '-': 'minus',
  '=': 'equal',
  ',': 'comma',
  '.': 'period',
  '/': 'slash',
};

function toHotkey(binding: string): string {
  const parts = binding.trim().toLowerCase().split('+');
  // A trailing '+' (e.g. 'command+shift+') means the '+' key itself, which is
  // shift + '=' on US layouts.
  return parts
    .map((part, i) =>
      part === '' && i === parts.length - 1 ? 'equal' : part.trim(),
    )
    .filter((part) => part !== '')
    .map((part) => keyAliases[part] ?? part)
    .join('+');
}

function toHotkeys(binding: string | string[] | undefined): string[] {
  if (!binding) return [];
  const bindings = Array.isArray(binding) ? binding : [binding];
  return bindings.map(toHotkey).filter((hk) => hk.length > 0);
}

/**
 * Events already consumed by a mounted `useKeyBindings`. react-hotkeys called
 * only the first matching handler across all global key maps (in mount
 * order); react-hotkeys-hook calls every match. Without this, a key bound by
 * both a perspective and the entry viewer (e.g. `down` → next document) would
 * fire twice.
 */
const handledEvents = new WeakSet<KeyboardEvent>();

/**
 * Binds a map of `actionName → key binding` to `actionName → handler`, like
 * react-hotkeys' `<GlobalHotKeys keyMap handlers>`. Listens on the document;
 * events from inputs, textareas, selects and contentEditable are ignored.
 * Handlers are read from a ref, so passing fresh closures on every render is
 * fine and does not re-register the listener.
 */
export function useKeyBindings(
  keyMap: Record<string, string | string[] | undefined>,
  handlers: Record<string, KeyBindingHandler | undefined>,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const keyMapSignature = JSON.stringify(keyMap);
  const { hotkeys, actionByHotkey } = useMemo(() => {
    const byHotkey = new Map<string, string>();
    Object.entries(keyMap).forEach(([action, binding]) => {
      toHotkeys(binding).forEach((hk) => {
        if (!byHotkey.has(hk)) byHotkey.set(hk, action);
      });
    });
    return {
      hotkeys: Array.from(byHotkey.keys()),
      actionByHotkey: byHotkey,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyMapSignature]);

  const actionRef = useRef(actionByHotkey);
  actionRef.current = actionByHotkey;

  useHotkeys(
    hotkeys,
    (event, hotkeysEvent) => {
      if (handledEvents.has(event)) return;
      const action = actionRef.current.get(hotkeysEvent.hotkey);
      const handler = action ? handlersRef.current[action] : undefined;
      if (!handler) return;
      handledEvents.add(event);
      handler(event);
    },
    { enabled: hotkeys.length > 0 },
  );
}
