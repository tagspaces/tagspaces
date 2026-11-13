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

// Building blocks shared by the Grid (GridCell) and List (RowCell)
// perspectives. Both cells render the same data (thumbnail, tags, extension
// badge) in a different layout; keeping the logic here means a fix in one
// place reaches both perspectives.

import {
  FolderOutlineIcon,
  SelectedIcon,
  UnSelectedIcon,
} from '-/components/CommonIcons';
import FileExtBadge from '-/components/FileExtBadge';
import TagContainer from '-/components/TagContainer';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagsOverflowChip from '-/components/TagsOverflowChip';
import TagsPreview from '-/components/TagsPreview';
import TsTooltip from '-/components/TsTooltip';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCellVisibility } from '-/perspectives/grid/hooks/CellVisibilityContext';
import { getTagDelimiter, isReorderTags } from '-/reducers/settings';
import i18n from '-/services/i18n';
import { getDescriptionPreview } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { arrayBufferToDataURL } from '-/utils/dom';
import useFirstRender from '-/utils/useFirstRender';
import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
  extractTagsAsObjects,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

const EMPTY_TAGS: TS.Tag[] = [];

function normalizeEntryPath(p: string) {
  return cleanTrailingDirSeparator(cleanFrontDirSeparator(p));
}

/**
 * Resolves the thumbnail URL for an entry once its cell scrolls near the
 * viewport. Handles encrypted locations (decrypts to a data URL), signed
 * cloud URLs (via `location.getThumbPath`) and live thumbnail changes coming
 * from the meta-actions stream.
 *
 * Attach `cellRef` to the cell's root element.
 */
export function useEntryThumbnail(
  fsEntry: TS.FileSystemEntry,
  location: CommonLocation | undefined,
) {
  const [thumbSrc, setThumbSrc] = useState<string | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const cellElRef = useRef<HTMLElement | null>(null);
  const visibility = useCellVisibility();
  const { metaActions } = useEditedEntryMetaContext();
  const firstRender = useFirstRender();

  const thumbPath = fsEntry.meta?.thumbPath;
  const lastUpdated = fsEntry.meta?.lastUpdated;

  // Depend on the stable thumbnail identity (path + cache-bust key), NOT the
  // whole `meta` object — the latter gets a new reference on every staged
  // directory re-set (base listing -> meta -> thumbnails), which would
  // otherwise re-resolve and visibly blank an unchanged thumbnail on reload.
  const resolveThumb = useCallback(async () => {
    if (!location || !fsEntry.meta?.thumbPath) {
      setThumbSrc(undefined);
      return;
    }
    if (location.encryptionKey) {
      try {
        const thumbFilePath = getThumbFileLocationForFile(
          fsEntry.path,
          location.getDirSeparator(),
          false,
        );
        const arrayBuffer = await location.getFileContentPromise(
          thumbFilePath,
          'arraybuffer',
        );
        if (arrayBuffer) {
          setThumbSrc(await arrayBufferToDataURL(arrayBuffer, 'image/jpeg'));
          return;
        }
      } catch {
        // fall back to the plain URL below
      }
    }
    try {
      const url = await location.getThumbPath(
        fsEntry.meta.thumbPath,
        fsEntry.meta?.lastUpdated,
      );
      setThumbSrc(url ?? undefined);
    } catch {
      setThumbSrc(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, fsEntry.path, thumbPath, lastUpdated]);

  useEffect(() => {
    if (isVisible) resolveThumb();
  }, [isVisible, resolveThumb]);

  // Subscribe the cell root to the shared IntersectionObserver. Only the first
  // transition to visible matters — once resolved, thumbSrc stays cached for
  // scroll-back.
  useEffect(() => {
    const el = cellElRef.current;
    if (!el) return undefined;
    const cb = (visible: boolean) => {
      if (visible) setIsVisible(true);
    };
    if (visibility.observe(el, cb)) setIsVisible(true);
    return () => visibility.unobserve(el, cb);
  }, [visibility]);

  useEffect(() => {
    if (firstRender || !metaActions || metaActions.length === 0) return;
    const entryPath = normalizeEntryPath(fsEntry.path);
    for (const action of metaActions) {
      if (action.entry && normalizeEntryPath(action.entry.path) === entryPath) {
        fsEntry.meta = { ...action.entry.meta };
        if (action.action === 'thumbChange') {
          setThumbSrc(undefined);
          resolveThumb();
        } else if (
          action.action === 'bgdColorChange' ||
          action.action === 'descriptionChange'
        ) {
          resolveThumb();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaActions]);

  const cellRef = useCallback((node: HTMLElement | null) => {
    cellElRef.current = node;
  }, []);

  const onThumbError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.style.display = 'none';
    },
    [],
  );

  return {
    cellRef,
    // `#` in a local path would otherwise be read as a URL fragment.
    thumbSrc: thumbPath && thumbSrc ? thumbSrc.replace(/#/g, '%23') : undefined,
    onThumbError,
  };
}

/**
 * Merges sidecar tags with tags embedded in the file name (sidecar wins on
 * duplicate titles) and splits them at `maxVisibleTags` into the inline chips
 * and the "+N" overflow.
 */
export function useEntryTags(
  fsEntry: TS.FileSystemEntry,
  location: CommonLocation | undefined,
  maxVisibleTags: number | undefined,
) {
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const sidecarTags: TS.Tag[] = fsEntry.meta?.tags ?? EMPTY_TAGS;

  // Prefer the value pre-parsed at load time by DirectoryContentContextProvider;
  // parse on the fly only for entries that arrived through another path.
  const fileNameTags = useMemo(() => {
    if (!fsEntry.isFile) return EMPTY_TAGS;
    if (fsEntry.parsedNameTags !== undefined) return fsEntry.parsedNameTags;
    return extractTagsAsObjects(
      fsEntry.name,
      tagDelimiter,
      location?.getDirSeparator(),
    );
  }, [
    fsEntry.isFile,
    fsEntry.name,
    fsEntry.parsedNameTags,
    tagDelimiter,
    location,
  ]);

  return useMemo(() => {
    const sidecarTitles = new Set(sidecarTags.map((t) => t.title));
    const entryTags = [
      ...sidecarTags,
      ...fileNameTags.filter((t) => !sidecarTitles.has(t.title)),
    ];
    const cap =
      typeof maxVisibleTags === 'number' && maxVisibleTags > 0
        ? maxVisibleTags
        : Infinity;
    const overflow = entryTags.length > cap;
    return {
      entryTags,
      visibleTags: overflow ? entryTags.slice(0, cap) : entryTags,
      overflowTags: overflow ? entryTags.slice(cap) : undefined,
    };
  }, [sidecarTags, fileNameTags, maxVisibleTags]);
}

export function useDescriptionPreview(
  fsEntry: TS.FileSystemEntry,
  show: boolean,
  maxLength: number,
): string | undefined {
  const raw = fsEntry.meta?.description;
  return useMemo(() => {
    if (!show || !raw) return undefined;
    return raw.length > maxLength ? getDescriptionPreview(raw, maxLength) : raw;
  }, [show, raw, maxLength]);
}

type TagHandler = (
  event: Object,
  tag: TS.Tag,
  entry: TS.FileSystemEntry,
) => void;

interface EntryTagsProps {
  fsEntry: TS.FileSystemEntry;
  entryTags: TS.Tag[];
  visibleTags: TS.Tag[];
  overflowTags?: TS.Tag[];
  showTags: boolean;
  staticTags: boolean;
  handleTagMenu: TagHandler;
}

/**
 * Inline tag chips plus the "+N" overflow chip. When tags are hidden in the
 * perspective settings it falls back to the compact colour-dot preview.
 */
export function EntryTags({
  fsEntry,
  entryTags,
  visibleTags,
  overflowTags,
  showTags,
  staticTags,
  handleTagMenu,
}: EntryTagsProps) {
  const { addTag, editTagForEntry } = useTaggingActionsContext();
  const reorderTags: boolean = useSelector(isReorderTags);

  const handleAddTag = useCallback(
    (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
      addTag([tag], parentTagGroupUuid);
    },
    [addTag],
  );

  if (!showTags || entryTags.length === 0) {
    return <TagsPreview tags={entryTags} />;
  }

  let sideCarLength = 0;
  return (
    <>
      {visibleTags.map((tag: TS.Tag, index) => {
        const key = fsEntry.path + tag.title;
        const container = staticTags ? (
          <TagContainer
            key={key}
            tag={tag}
            entry={fsEntry}
            handleTagMenu={handleTagMenu}
          />
        ) : (
          <TagContainerDnd
            key={key}
            tag={tag}
            index={tag.type === 'sidecar' ? index : index - sideCarLength}
            entry={fsEntry}
            addTag={handleAddTag}
            handleTagMenu={handleTagMenu}
            editTagForEntry={editTagForEntry}
            reorderTags={reorderTags}
          />
        );
        if (tag.type === 'sidecar') sideCarLength = index + 1;
        return container;
      })}
      {overflowTags && (
        <TagsOverflowChip
          remaining={overflowTags}
          entry={fsEntry}
          handleTagMenu={handleTagMenu}
        />
      )}
    </>
  );
}

interface EntryBadgeProps {
  fsEntry: TS.FileSystemEntry;
  color: string;
  selected: boolean;
  selectionMode: boolean;
  /** Fixed badge width, e.g. so titles line up in the list perspective. */
  width?: number;
}

/**
 * Coloured extension badge. Clicking it selects the entry; in selection mode
 * it turns into a checkbox that toggles the entry.
 */
export function EntryBadge({
  fsEntry,
  color,
  selected,
  selectionMode,
  width,
}: EntryBadgeProps) {
  // Intentionally do not subscribe to selectedEntries here — `selected` comes
  // from the parent, so a selection change elsewhere doesn't repaint us.
  const { selectEntry } = useSelectedEntriesContext();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectionMode) {
        selectEntry(fsEntry, !selected);
      } else {
        selectEntry(fsEntry);
      }
    },
    [selectionMode, selectEntry, fsEntry, selected],
  );

  return (
    <TsTooltip
      title={
        <>
          {fsEntry.isBrokenSymlink ? (
            <>
              {i18n.t('core:brokenSymbolicLink')}
              <br />
            </>
          ) : fsEntry.isSymbolicLink ? (
            <>
              {i18n.t('core:symbolicLinkTo', {
                target: fsEntry.symlinkTargetPath || '?',
              })}
              <br />
            </>
          ) : null}
          {i18n.t('clickToSelect')}: {fsEntry.name}
        </>
      }
    >
      <FileExtBadge
        sx={{
          backgroundColor: color,
          flexShrink: 0,
          ...(width && {
            width,
            minWidth: width,
            maxWidth: width,
            display: 'block',
            lineHeight: '25px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }),
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'transform 120ms ease',
          '&:active': { transform: 'scale(0.94)' },
        }}
        noWrap
        variant="button"
        onClick={handleClick}
      >
        {selectionMode ? (
          selected ? (
            <SelectedIcon />
          ) : (
            <UnSelectedIcon />
          )
        ) : fsEntry.isFile ? (
          fsEntry.extension
        ) : (
          <FolderOutlineIcon />
        )}
      </FileExtBadge>
    </TsTooltip>
  );
}

/**
 * Class name for the "more" button. Cells reveal it on hover/selection on
 * pointer devices; on touch devices it is always visible.
 */
export const CELL_MENU_BUTTON_CLASS = 'ts-cell-menu-button';

export const revealOnHoverSx = (selected: boolean) => ({
  [`& .${CELL_MENU_BUTTON_CLASS}`]: {
    transition: 'opacity 150ms ease',
  },
  '@media (hover: hover)': {
    [`& .${CELL_MENU_BUTTON_CLASS}`]: { opacity: selected ? 1 : 0 },
    [`&:hover .${CELL_MENU_BUTTON_CLASS}, & .${CELL_MENU_BUTTON_CLASS}:focus-visible`]:
      { opacity: 1 },
  },
});

/**
 * A solid-colour image layer. Used to put a translucent tint *over* an opaque
 * background colour, so a selected/hovered cell never lets the folder's
 * background (dark colour, image) bleed through and hurt text contrast.
 */
export const tintLayer = (color: string) =>
  `linear-gradient(${color}, ${color})`;
