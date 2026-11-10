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
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';
import {
  CalendarIcon,
  ClearColorIcon,
  CloudLocationIcon,
  ColorPaletteIcon,
  CopyToClipboardIcon,
  IDIcon,
  LocalLocationIcon,
  OpenLinkIcon,
  PictureIcon,
  QrCodeIcon,
  RenameIcon,
  SetColorIcon,
  SizeIcon,
  ThemingIcon,
} from '-/components/CommonIcons';
import ElectronTileLayer from '-/components/ElectronTileLayer';
import { ProTooltip } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import NoTileServer from '-/components/NoTileServer';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TagDropContainer from '-/components/TagDropContainer';
import TagsSelect from '-/components/TagsSelect';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import TsTooltip from '-/components/TsTooltip';
import LinkGeneratorDialog from '-/components/dialogs/LinkGeneratorDialog';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import {
  AttributionControl,
  MapContainer,
  Marker,
  Popup,
} from '-/components/leaflet';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getTagDelimiter } from '-/reducers/settings';
import {
  dirNameValidation,
  fileNameValidation,
  getAllTags,
  openUrl,
  sanitizeAttribution,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { generateClipboardLink } from '-/utils/dom';
import { formatTimestampLocal } from '-/utils/formatLocalTime';
import { parseGeoLocation } from '-/utils/geo';
import useFirstRender from '-/utils/useFirstRender';
import {
  Box,
  Divider,
  FormHelperText,
  InputAdornment,
  InputBase,
  Popover,
  Stack,
  Typography,
} from '@mui/material';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import L from 'leaflet';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Pro } from '../pro';

const CustomBackgroundDialog =
  Pro && Pro.UI ? Pro.UI.CustomBackgroundDialog : false;

// https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Icon.Default.js#L22
const fileMarkerIcon = new L.Icon({
  iconUrl: MarkerIcon,
  iconRetinaUrl: Marker2xIcon,
  shadowUrl: MarkerShadowIcon,
  tooltipAnchor: [16, -28],
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  shadowAnchor: [5, 41],
  popupAnchor: [1, -34],
});

/** Wraps a resolved image path for use as a CSS background-image. */
const toCssUrl = (path?: string): string | undefined =>
  path ? `url("${path.replace(/#/g, '%23')}")` : undefined;

function findGeoLocation(tags?: Array<TS.Tag>) {
  if (!Pro || !tags) return undefined;
  return tags
    .map((tag) => parseGeoLocation(tag.title))
    .find((geo) => geo !== undefined);
}

/* ------------------------------------------------------------------ */
/* Presentational building blocks                                      */
/* ------------------------------------------------------------------ */

/** Layout tokens — the same on every device. */
const UI = {
  rowMinHeight: 46,
  rowPaddingY: 0.75,
  iconSize: 20,
  valueFontSize: 14,
  nameFontSize: 15,
  sectionGap: 2,
  mapHeight: 200,
  tileMaxHeight: 200,
  placeholderIconSize: 32,
  swatchHeight: 24,
  presetWidth: 35,
};

/**
 * Touch tweaks that change behavior, not size: no double-tap-zoom delay and
 * no grey tap flash on custom (non-MUI) clickable elements.
 */
const touchFriendly = {
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
};

function Section({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box component="section">
      {title && (
        <Typography
          variant="overline"
          component="h3"
          sx={{
            display: 'block',
            color: 'text.secondary',
            lineHeight: 1.5,
            letterSpacing: '0.08em',
            px: 0.5,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}

/** Bordered surface that renders its children as divider-separated rows. */
function Card({ children }: { children: ReactNode }) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: AppConfig.defaultCSSRadius,
        overflow: 'hidden',
      }}
    >
      {rows.map((row, i) => (
        <React.Fragment key={(row as React.ReactElement).key}>
          {i > 0 && <Divider />}
          {row}
        </React.Fragment>
      ))}
    </Box>
  );
}

interface PropertyRowProps {
  icon: ReactNode;
  label: ReactNode;
  info?: string;
  /** Rendered as a read-only input so it stays selectable and testable. */
  value?: string;
  placeholder?: string;
  /** Free-form content instead of a text value. */
  content?: ReactNode;
  title?: string;
  actions?: ReactNode;
  tid?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

function PropertyRow({
  icon,
  label,
  info,
  value,
  placeholder,
  content,
  title,
  actions,
  tid,
  inputRef,
}: PropertyRowProps) {
  return (
    <Box
      data-tid={tid}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: UI.rowPaddingY,
        minHeight: UI.rowMinHeight,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          color: 'text.secondary',
          flexShrink: 0,
          '& svg': { fontSize: UI.iconSize },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', lineHeight: 1.3 }}
          >
            {label}
          </Typography>
          {info && (
            <Box sx={{ display: 'flex', '& svg': { fontSize: 14 } }}>
              <InfoIcon tooltip={info} />
            </Box>
          )}
        </Stack>
        {content ??
          (value !== undefined && (
            <InputBase
              value={value}
              placeholder={placeholder}
              inputRef={inputRef}
              readOnly
              fullWidth
              inputProps={{ title: title ?? value }}
              sx={{
                fontSize: UI.valueFontSize,
                '& input': {
                  p: 0,
                  textOverflow: 'ellipsis',
                },
              }}
            />
          ))}
      </Box>
      {actions && (
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}

interface ImageTileProps {
  label: string;
  image?: string;
  editable: boolean;
  onEdit: () => void;
  buttonTid: string;
  tileTid?: string;
  tooltip: string;
}

function ImageTile({
  label,
  image,
  editable,
  onEdit,
  buttonTid,
  tileTid,
  tooltip,
}: ImageTileProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ display: 'block', color: 'text.secondary', px: 0.5, mb: 0.5 }}
      >
        {label}
      </Typography>
      <Box
        data-tid={tileTid}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : -1}
        aria-label={tooltip}
        onClick={editable ? onEdit : undefined}
        onKeyDown={(e) => {
          if (editable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onEdit();
          }
        }}
        sx={{
          aspectRatio: '4 / 3',
          maxHeight: UI.tileMaxHeight,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 1,
          borderColor: 'divider',
          borderStyle: image ? 'solid' : 'dashed',
          borderRadius: AppConfig.defaultCSSRadius,
          backgroundImage: image ?? 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'text.disabled',
          cursor: editable ? 'pointer' : 'default',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...touchFriendly,
          // Hover only where a real pointer hovers, so a tap on a touch
          // screen doesn't leave the tile stuck in its highlighted state.
          ...(editable && {
            '@media (hover: hover)': {
              '&:hover': { borderColor: 'primary.main' },
            },
            '&:focus-visible': { borderColor: 'primary.main', outline: 'none' },
          }),
        }}
      >
        {!image && <PictureIcon sx={{ fontSize: UI.placeholderIconSize }} />}
      </Box>
      {editable && (
        <ProTooltip tooltip={tooltip}>
          <TsButton
            data-tid={buttonTid}
            variant="text"
            fullWidth
            onClick={onEdit}
            sx={{ mt: 0.5 }}
          >
            {t('core:change')}
          </TsButton>
        </ProTooltip>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* EntryProperties                                                     */
/* ------------------------------------------------------------------ */

interface Props {
  tileServer: TS.MapTileServer;
}

function EntryProperties({ tileServer }: Props) {
  const { t } = useTranslation();
  const { openedEntry, sharingLink, getOpenedDirProps, fileChanged } =
    useOpenedEntryContext();
  const { openMoveCopyFilesDialog } = useMenuContext();
  const { isEditMode, setEditMode } = useFilePropertiesContext();
  const {
    renameDirectory,
    renameFile,
    setBackgroundColorChange,
    saveDirectoryPerspective,
  } = useIOActionsContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { addTagsToFsEntry, removeTagsFromEntry } = useTaggingActionsContext();
  const { findLocation } = useCurrentLocationContext();
  const { showNotification, openConfirmDialog } = useNotificationContext();
  const thumbDialogContext = Pro?.contextProviders?.ThumbDialogContext
    ? useContext<TS.ThumbDialogContextData>(
        Pro.contextProviders.ThumbDialogContext,
      )
    : undefined;
  const bgndDialogContext = Pro?.contextProviders?.BgndDialogContext
    ? useContext<TS.BgndDialogContextData>(
        Pro.contextProviders.BgndDialogContext,
      )
    : undefined;
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const firstRender = useFirstRender();

  const location = findLocation(openedEntry?.locationID);
  const dirSeparator = location?.getDirSeparator();
  const isFile = !!openedEntry?.isFile;
  const isReadOnly = !!location?.isReadOnly;

  const entryName = useMemo(() => {
    if (!openedEntry) return '';
    return openedEntry.isFile
      ? extractFileName(openedEntry.path, dirSeparator)
      : extractDirectoryName(openedEntry.path, dirSeparator);
  }, [openedEntry, dirSeparator]);

  // --- state -------------------------------------------------------------
  const [editName, setEditName] = useState<string>();
  const [renameBlockedTooltip, setRenameBlockedTooltip] = useState(false);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [paletteAnchor, setPaletteAnchor] = useState<HTMLElement | null>(null);
  const [thumbImage, setThumbImage] = useState<string>();
  const [bgndImage, setBgndImage] = useState<string>();
  const [dirProps, setDirProps] = useState<TS.DirProp>();
  const [calculatingSize, setCalculatingSize] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const thumbRequest = useRef(0);
  const bgndRequest = useRef(0);

  const isRenaming = editName !== undefined;
  const nameInvalid =
    isRenaming &&
    !!(isFile ? fileNameValidation(editName) : dirNameValidation(editName));
  const canConfirmRename = isRenaming && !nameInvalid && editName !== entryName;
  /** Write actions are offered only when nothing else is being edited. */
  const canEdit = !isReadOnly && !isEditMode && !isRenaming;

  // --- images --------------------------------------------------------------
  // Request counters drop responses that arrive after a newer request, so a
  // slow load for a previous entry can't overwrite the current one.
  const reloadThumbnail = () => {
    if (!location || !openedEntry) return;
    const req = ++thumbRequest.current;
    location
      .getThumbPath(openedEntry.meta?.thumbPath, openedEntry.meta?.lastUpdated)
      .then((path) => {
        if (req === thumbRequest.current) setThumbImage(toCssUrl(path));
      })
      .catch(() => {
        if (req === thumbRequest.current) setThumbImage(undefined);
      });
  };

  const reloadBackground = () => {
    if (!location || !openedEntry || openedEntry.isFile) return;
    const req = ++bgndRequest.current;
    location
      .getFolderBgndPath(openedEntry.path, openedEntry.meta?.lastUpdated)
      .then((path) => {
        if (req === bgndRequest.current) setBgndImage(toCssUrl(path));
      })
      .catch(() => {
        if (req === bgndRequest.current) setBgndImage(undefined);
      });
  };

  useEffect(() => {
    reloadThumbnail();
    reloadBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedEntry]);

  useEffect(() => {
    if (firstRender || !openedEntry || !metaActions?.length) return;
    if (metaActions.some((a) => a.action === 'thumbChange')) reloadThumbnail();
    if (metaActions.some((a) => a.action === 'bgdImgChange'))
      reloadBackground();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaActions]);

  // Folder size belongs to one folder — forget it when another entry opens.
  useEffect(() => {
    setDirProps(undefined);
    setEditName(undefined);
  }, [openedEntry?.path]);

  useEffect(() => {
    if (isRenaming) nameInputRef.current?.focus();
  }, [isRenaming]);

  useEffect(() => () => clearTimeout(tooltipTimer.current), []);

  // --- rename --------------------------------------------------------------
  const startRename = useCallback(() => {
    if (isReadOnly) return;
    setEditName(entryName);
  }, [isReadOnly, entryName]);

  const cancelRename = useCallback(() => setEditName(undefined), []);

  const confirmRename = useCallback(() => {
    if (!canConfirmRename || !openedEntry) return;
    const parent = extractContainingDirectoryPath(
      openedEntry.path,
      dirSeparator,
    );
    const nextPath =
      (parent && parent !== dirSeparator ? parent + dirSeparator : '') +
      editName;
    // On failure the field simply shows entryName again, since it is derived.
    if (openedEntry.isFile) {
      renameFile(openedEntry.path, nextPath, openedEntry.locationID).catch(
        () => {},
      );
    } else {
      renameDirectory(openedEntry.path, editName, openedEntry.locationID).catch(
        () => {},
      );
    }
    setEditName(undefined);
  }, [
    canConfirmRename,
    openedEntry,
    dirSeparator,
    editName,
    renameFile,
    renameDirectory,
  ]);

  const handleNameFieldClick = useCallback(() => {
    if (isRenaming || isReadOnly) return;
    if (isEditMode) {
      // Clicking the name while the file is open for editing leaves edit mode
      // and starts renaming — unless unsaved changes would be lost, in which
      // case a tooltip explains why renaming is blocked.
      if (fileChanged) {
        setRenameBlockedTooltip(true);
        clearTimeout(tooltipTimer.current);
        tooltipTimer.current = setTimeout(
          () => setRenameBlockedTooltip(false),
          3000,
        );
        return;
      }
      setEditMode(false);
    }
    startRename();
  }, [
    isRenaming,
    isReadOnly,
    isEditMode,
    fileChanged,
    setEditMode,
    startRename,
  ]);

  // --- actions -------------------------------------------------------------
  const requirePro = useCallback(() => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return false;
    }
    return true;
  }, [showNotification, t]);

  const openThumbDialog = useCallback(() => {
    if (requirePro() && canEdit) {
      thumbDialogContext?.openThumbsDialog(openedEntry);
    }
  }, [requirePro, canEdit, thumbDialogContext, openedEntry]);

  const openBgndDialog = useCallback(() => {
    if (requirePro() && canEdit) {
      bgndDialogContext?.openBgndDialog(openedEntry);
    }
  }, [requirePro, canEdit, bgndDialogContext, openedEntry]);

  const openMoveCopy = useCallback(() => {
    if (!openedEntry) return;
    openMoveCopyFilesDialog([{ ...openedEntry, name: entryName, tags: [] }]);
  }, [openMoveCopyFilesDialog, openedEntry, entryName]);

  const calculateDirSize = useCallback(() => {
    setCalculatingSize(true);
    getOpenedDirProps()
      .then(setDirProps)
      .finally(() => setCalculatingSize(false));
  }, [getOpenedDirProps]);

  const copyToClipboard = useCallback(
    (items: ClipboardItem[], message: string) => {
      navigator.clipboard
        .write(items)
        .then(() => showNotification(message))
        .catch((e) => console.error('Clipboard write failed', e));
    },
    [showNotification],
  );

  const toggleColorPicker = useCallback(() => {
    if (isReadOnly || !requirePro()) return;
    setShowColorPicker((prev) => !prev);
  }, [isReadOnly, requirePro]);

  const changeColor = useCallback(
    (color: string) => {
      setBackgroundColorChange(openedEntry, color).then((success) => {
        if (success && openedEntry) {
          openedEntry.meta = { ...openedEntry.meta, color };
        }
      });
    },
    [openedEntry, setBackgroundColorChange],
  );

  const confirmClearColor = useCallback(() => {
    openConfirmDialog(
      t('core:confirm'),
      t('core:confirmResetColor'),
      (result) => {
        if (result) changeColor('transparent');
      },
      'cancelConfirmResetColorDialog',
      'confirmConfirmResetColorDialog',
      'confirmResetColorDialogContent',
    );
  }, [openConfirmDialog, t, changeColor]);

  const changePerspective = useCallback(
    (event: any) => {
      const perspective = event.target.value;
      openedEntry.meta = { ...openedEntry.meta, perspective };
      saveDirectoryPerspective(
        openedEntry,
        perspective,
        openedEntry.locationID,
      );
    },
    [openedEntry, saveDirectoryPerspective],
  );

  const handleTagsChange = useCallback(
    (name: string, value: Array<TS.Tag>, action: string) => {
      if (openedEntry && fileChanged) {
        showNotification(
          t('core:cantEditTagsFileOpened', { path: openedEntry.path }),
          'default',
          true,
        );
        return;
      }
      if (action === 'remove-value') {
        return value
          ? removeTagsFromEntry(openedEntry, value)
          : removeTagsFromEntry(openedEntry);
      }
      if (action === 'clear') {
        return removeTagsFromEntry(openedEntry);
      }
      // create-option or select-option
      const newTags = openedEntry.tags
        ? value.filter(
            (tag) => !openedEntry.tags.some((obj) => obj.title === tag.title),
          )
        : value;
      return addTagsToFsEntry(openedEntry, newTags);
    },
    [
      openedEntry,
      fileChanged,
      showNotification,
      t,
      removeTagsFromEntry,
      addTagsToFsEntry,
    ],
  );

  const geoLocation = useMemo(
    () => findGeoLocation(isFile ? openedEntry?.tags : openedEntry?.meta?.tags),
    [isFile, openedEntry],
  );

  // --- render --------------------------------------------------------------
  if (!openedEntry?.path) {
    return <div />;
  }

  const isCloudLocation = !!openedEntry.url && openedEntry.url.length > 5;
  const showDownloadLink =
    isCloudLocation && isFile && !openedEntry.isEncrypted;
  const entryId: string | undefined = openedEntry.meta?.id;
  const color = openedEntry.meta?.color;
  const hasColor = !!color && color !== 'transparent';

  let sizeValue: string;
  if (isFile) {
    sizeValue = formatBytes(openedEntry.size);
  } else if (dirProps) {
    sizeValue = formatBytes(dirProps.totalSize);
    if (!location?.haveObjectStoreSupport()) {
      sizeValue += ` · ${dirProps.dirsCount} ${t('core:directories')}, ${dirProps.filesCount} ${t('core:files')}`;
    }
  } else {
    sizeValue = location?.haveObjectStoreSupport()
      ? t('core:notAvailable')
      : '—';
  }

  const renameButtons = isRenaming && (
    <>
      <TsButton
        data-tid="cancelRenameEntryTID"
        variant="text"
        onClick={cancelRename}
      >
        {t('core:cancel')}
      </TsButton>
      <TsButton
        data-tid="confirmRenameEntryTID"
        variant="contained"
        disabled={!canConfirmRename}
        onClick={confirmRename}
        sx={{ ml: 0.5 }}
      >
        {t('core:confirmSaveButton')}
      </TsButton>
    </>
  );

  let nameAdornment: ReactNode = null;
  if (isRenaming) {
    nameAdornment = renameButtons;
  } else if (!isRenaming && !isReadOnly && !isEditMode) {
    nameAdornment = (
      <TsIconButton
        data-tid="startRenameEntryTID"
        tooltip={t('core:rename')}
        aria-label={t('core:rename')}
        onClick={startRename}
      >
        <RenameIcon />
      </TsIconButton>
    );
  }

  return (
    <Stack spacing={UI.sectionGap} sx={{ pb: 2 }}>
      {/* ---- Name & tags ---- */}
      <Box>
        <TsTooltip
          title={t('core:renameDisableTooltip')}
          open={renameBlockedTooltip}
          onClose={() => setRenameBlockedTooltip(false)}
        >
          <TsTextField
            data-tid="fileNameProperties"
            name="name"
            label={isFile ? t('core:fileName') : t('core:folderName')}
            value={isRenaming ? editName : entryName}
            error={nameInvalid}
            inputRef={nameInputRef}
            retrieveValue={() => (isRenaming ? editName : entryName)}
            onClick={handleNameFieldClick}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEditName(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmRename();
              else if (e.key === 'Escape') cancelRename();
            }}
            sx={{
              '& input': {
                fontSize: UI.nameFontSize,
                fontWeight: 500,
                cursor: isRenaming || isReadOnly ? 'text' : 'pointer',
              },
            }}
            slotProps={{
              input: {
                readOnly: !isRenaming,
                endAdornment: nameAdornment && (
                  <InputAdornment position="end">
                    {nameAdornment}
                  </InputAdornment>
                ),
              },
            }}
          />
        </TsTooltip>
        {nameInvalid && (
          <FormHelperText error sx={{ mt: 0, mx: 0.75 }}>
            {t(isFile ? 'core:fileNameHelp' : 'core:directoryNameHelp')}
          </FormHelperText>
        )}
        <Box sx={{ mt: 1.5 }}>
          <TagDropContainer entry={openedEntry}>
            <TagsSelect
              label={t('core:fileTags')}
              dataTid="PropertiesTagsSelectTID"
              placeholderText={t('core:dropHere')}
              tags={getAllTags(openedEntry, tagDelimiter)}
              tagMode="default"
              handleChange={handleTagsChange}
              selectedEntry={openedEntry}
              generateButton
            />
          </TagDropContainer>
        </Box>
      </Box>

      {/* ---- Map ---- */}
      {geoLocation && (
        <Box
          sx={{
            height: UI.mapHeight,
            borderRadius: AppConfig.defaultCSSRadius,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            doubleClickZoom
            keyboard={false}
            dragging
            center={[geoLocation.lat, geoLocation.lng]}
            zoom={10}
            scrollWheelZoom={false}
            zoomControl
            attributionControl={false}
          >
            {tileServer ? (
              <ElectronTileLayer
                attribution={sanitizeAttribution(tileServer.serverInfo)}
                url={tileServer.serverURL}
              />
            ) : (
              <NoTileServer />
            )}
            <Marker
              icon={fileMarkerIcon}
              position={[geoLocation.lat, geoLocation.lng]}
            >
              <Popup>
                <Typography sx={{ mb: 1 }}>
                  {`${t('core:lat')}: ${geoLocation.lat}, ${t('core:lng')}: ${geoLocation.lng}`}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TsButton
                    onClick={() =>
                      openUrl(
                        `https://www.openstreetmap.org/?mlat=${geoLocation.lat}&mlon=${geoLocation.lng}#map=10/${geoLocation.lat}/${geoLocation.lng}`,
                      )
                    }
                  >
                    {t('core:openInApp', { appName: 'OpenStreetMap' })}
                  </TsButton>
                  <TsButton
                    onClick={() =>
                      openUrl(
                        `https://maps.google.com/?q=${geoLocation.lat},${geoLocation.lng}&ll=${geoLocation.lat},${geoLocation.lng}&z=10`,
                      )
                    }
                  >
                    {t('core:openInApp', { appName: 'Google Maps' })}
                  </TsButton>
                </Stack>
              </Popup>
            </Marker>
            <AttributionControl position="bottomright" prefix="" />
          </MapContainer>
        </Box>
      )}

      {/* ---- Details ---- */}
      <Section title={t('core:details')}>
        <Card>
          <PropertyRow
            icon={<CalendarIcon />}
            label={t('core:fileLDTM')}
            value={
              openedEntry.lmdt ? formatTimestampLocal(openedEntry.lmdt) : '—'
            }
          />
          {AppConfig.isElectron && openedEntry.cdt && (
            <PropertyRow
              icon={<CalendarIcon />}
              label={t('core:creationDate')}
              value={formatTimestampLocal(openedEntry.cdt)}
            />
          )}
          <PropertyRow
            icon={<SizeIcon />}
            label={t('core:fileSize')}
            value={sizeValue}
            actions={
              !isFile && (
                <TsButton
                  variant="text"
                  loading={calculatingSize}
                  onClick={calculateDirSize}
                >
                  {t('core:calculate')}
                </TsButton>
              )
            }
          />
          <PropertyRow
            tid="filePathProperties"
            icon={
              isCloudLocation ? <CloudLocationIcon /> : <LocalLocationIcon />
            }
            label={isCloudLocation ? t('core:cloudPath') : t('core:filePath')}
            value={openedEntry.path}
            title={openedEntry.url || openedEntry.path}
            actions={
              <>
                <TsIconButton
                  tooltip={t('core:copy')}
                  aria-label={t('core:copy')}
                  onClick={() =>
                    navigator.clipboard
                      .writeText(openedEntry.path)
                      .then(() => showNotification(t('core:pathCopied')))
                  }
                >
                  <CopyToClipboardIcon fontSize="small" />
                </TsIconButton>
                {canEdit && (
                  <TsButton
                    data-tid="moveCopyEntryTID"
                    variant="text"
                    onClick={openMoveCopy}
                  >
                    {t('core:moveFile')}
                  </TsButton>
                )}
              </>
            }
          />
          <PropertyRow
            tid="entryIDTID"
            icon={<IDIcon />}
            label={t('core:entryId')}
            info={t('core:entryIdTooltip')}
            value={entryId ?? ''}
            placeholder={t('core:notAvailable')}
            actions={
              <TsIconButton
                data-tid="copyIdToClipboardTID"
                tooltip={t('core:copyIdToClipboard')}
                aria-label={t('core:copyIdToClipboard')}
                disabled={!entryId}
                onClick={() =>
                  copyToClipboard(
                    generateClipboardLink(entryId, entryId),
                    t('core:entryIdCopied'),
                  )
                }
              >
                <CopyToClipboardIcon fontSize="small" />
              </TsIconButton>
            }
          />
        </Card>
      </Section>

      {/* ---- Links ---- */}
      <Section title={t('core:links')}>
        <Card>
          <PropertyRow
            tid="sharingLinkTID"
            icon={<OpenLinkIcon />}
            label={t('core:sharingLink')}
            info={t('core:sharingLinkTooltip')}
            value={sharingLink ?? ''}
            actions={
              <TsIconButton
                data-tid="copyLinkToClipboardTID"
                tooltip={t('core:copyLinkToClipboard')}
                aria-label={t('core:copyLinkToClipboard')}
                disabled={!sharingLink}
                onClick={() =>
                  copyToClipboard(
                    generateClipboardLink(
                      sharingLink,
                      extractTitle(openedEntry.name, !isFile, dirSeparator),
                    ),
                    t('core:linkCopied'),
                  )
                }
              >
                <CopyToClipboardIcon fontSize="small" />
              </TsIconButton>
            }
          />
          {showDownloadLink && (
            <PropertyRow
              icon={<QrCodeIcon />}
              label={t('core:downloadLink')}
              info={t('core:downloadLinkTooltip')}
              content={
                <TsButton
                  variant="text"
                  onClick={() => setShowLinkGenerator(true)}
                  sx={{ ml: -1 }}
                >
                  {t('core:generateDownloadLink')}
                </TsButton>
              }
            />
          )}
        </Card>
      </Section>

      {/* ---- Appearance ---- */}
      <Section title={t('core:appearance')}>
        <Stack spacing={1.5}>
          {!isFile && (
            <PerspectiveSelector
              onChange={changePerspective}
              defaultValue={openedEntry.meta?.perspective || 'unspecified'}
              label={t('core:choosePerspective')}
              testId="changePerspectiveTID"
            />
          )}
          {!isFile && (
            <Card>
              <PropertyRow
                icon={<ThemingIcon />}
                label={t('core:backgroundColor')}
                info={t('core:backgroundColorInfo')}
                content={
                  <TransparentBackground>
                    <Box
                      component="button"
                      type="button"
                      aria-label={t('core:editBackgroundColor')}
                      title={t('core:editBackgroundColor')}
                      disabled={isReadOnly}
                      onClick={toggleColorPicker}
                      sx={{
                        display: 'block',
                        width: '100%',
                        maxWidth: 220,
                        height: UI.swatchHeight,
                        mt: 0.5,
                        p: 0,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: AppConfig.defaultCSSRadius,
                        background: hasColor ? color : 'transparent',
                        cursor: isReadOnly ? 'default' : 'pointer',
                        ...touchFriendly,
                      }}
                    />
                  </TransparentBackground>
                }
                actions={
                  <>
                    <ProTooltip tooltip={t('core:changeBackgroundColor')}>
                      <TsIconButton
                        data-tid="changeBackgroundColorTID"
                        aria-label={t('core:changeBackgroundColor')}
                        aria-haspopup="true"
                        disabled={!Pro || isReadOnly}
                        onClick={(e) => setPaletteAnchor(e.currentTarget)}
                      >
                        <ColorPaletteIcon />
                      </TsIconButton>
                    </ProTooltip>
                    {hasColor && (
                      <ProTooltip tooltip={t('core:clearFolderColor')}>
                        <TsIconButton
                          data-tid="backgroundClearTID"
                          aria-label={t('core:clearFolderColor')}
                          disabled={!Pro || isReadOnly}
                          onClick={confirmClearColor}
                        >
                          <ClearColorIcon />
                        </TsIconButton>
                      </ProTooltip>
                    )}
                  </>
                }
              />
            </Card>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isFile ? '1fr' : '1fr 1fr',
              gap: 1.5,
            }}
          >
            <ImageTile
              label={t('core:thumbnail')}
              image={thumbImage}
              editable={canEdit}
              onEdit={openThumbDialog}
              buttonTid="changeThumbnailTID"
              tooltip={t('core:changeThumbnail')}
            />
            {!isFile && (
              <ImageTile
                label={t('core:backgroundImage')}
                image={bgndImage}
                editable={canEdit}
                onEdit={openBgndDialog}
                buttonTid="changeBackgroundImageTID"
                tileTid="propsBgnImageTID"
                tooltip={t('core:changeBackgroundImage')}
              />
            )}
          </Box>
        </Stack>
      </Section>

      <Popover
        open={!!paletteAnchor}
        anchorEl={paletteAnchor}
        onClose={() => setPaletteAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, auto)',
            gap: 0.5,
            p: 1,
          }}
        >
          {AppConfig.backgroundColors.map((background, i) => (
            <TsIconButton
              key={background}
              data-tid={`backgroundTID${i}`}
              aria-label="changeFolderBackround"
              onClick={() => {
                changeColor(background);
                setPaletteAnchor(null);
              }}
            >
              <Box
                sx={{
                  width: UI.presetWidth,
                  pt: '5px',
                  borderRadius: AppConfig.defaultCSSRadius,
                  backgroundColor: background,
                  backgroundImage: background,
                }}
              >
                <SetColorIcon />
              </Box>
            </TsIconButton>
          ))}
        </Box>
      </Popover>

      {showLinkGenerator && (
        <LinkGeneratorDialog
          open={showLinkGenerator}
          onClose={() => setShowLinkGenerator(false)}
        />
      )}
      {CustomBackgroundDialog && (
        <CustomBackgroundDialog
          color={color}
          open={showColorPicker}
          setColor={changeColor}
          onClose={toggleColorPicker}
          currentDirectoryPath={openedEntry.path}
        />
      )}
    </Stack>
  );
}

export default EntryProperties;
