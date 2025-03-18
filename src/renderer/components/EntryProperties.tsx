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
  IDIcon,
  LocalLocationIcon,
  OpenLinkIcon,
  QrCodeIcon,
  SetColorIcon,
  SizeIcon,
} from '-/components/CommonIcons';
import { ProTooltip } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import NoTileServer from '-/components/NoTileServer';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import TagDropContainer from '-/components/TagDropContainer';
import TagsSelect from '-/components/TagsSelect';
import Tooltip from '-/components/Tooltip';
import TransparentBackground from '-/components/TransparentBackground';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import LinkGeneratorDialog from '-/components/dialogs/LinkGeneratorDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { isDesktopMode } from '-/reducers/settings';
import {
  dirNameValidation,
  fileNameValidation,
  getAllTags,
  openUrl,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { generateClipboardLink } from '-/utils/dom';
import { parseGeoLocation } from '-/utils/geo';
import useFirstRender from '-/utils/useFirstRender';
import {
  Box,
  FormControl,
  InputAdornment,
  Popover,
  Typography,
  inputBaseClasses,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import { styled, useTheme } from '@mui/material/styles';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import L from 'leaflet';
import React, {
  ChangeEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  AttributionControl,
  LayerGroup,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { useSelector } from 'react-redux';
import { Pro } from '../pro';

const ThumbnailTextField = styled(TsTextField)(({ theme }) => ({
  [`& .${inputBaseClasses.root}`]: {
    height: 220,
  },
}));

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;
const CustomBackgroundDialog =
  Pro && Pro.UI ? Pro.UI.CustomBackgroundDialog : false;
const BgndImgChooserDialog =
  Pro && Pro.UI ? Pro.UI.BgndImgChooserDialog : false;

interface Props {
  tileServer: TS.MapTileServer;
}

const defaultBackgrounds = [
  'transparent',
  '#00000044',
  '#ac725e44',
  '#f83a2244',
  '#ff753744',
  '#ffad4644',
  '#42d69244',
  '#00800044',
  '#7bd14844',
  '#fad16544',
  '#92e1c044',
  '#9fe1e744',
  '#9fc6e744',
  '#4986e744',
  '#9a9cff44',
  '#c2c2c244',
  '#cca6ac44',
  '#f691b244',
  '#cd74e644',
  '#a47ae244',
  '#845EC260',
  '#D65DB160',
  '#FF6F9160',
  '#FF967160',
  '#FFC75F60',
  '#F9F87160',
  '#008E9B60',
  '#008F7A60',
  'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 190) 45%, rgb(255, 204, 112) 100%)',
  'linear-gradient( 102deg,  rgba(253,189,85,1) 8%, rgba(249,131,255,1) 100% )',
  'radial-gradient( circle farthest-corner at 1.4% 2.8%,  rgba(240,249,249,1) 0%, rgba(182,199,226,1) 100% )',
  'linear-gradient( 110deg,  rgba(48,207,208,1) 11.2%, rgba(51,8,103,1) 90% )',
];

function EntryProperties(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
  const { openedEntry, sharingLink, getOpenedDirProps } =
    useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const {
    renameDirectory,
    renameFile,
    setBackgroundColorChange,
    saveDirectoryPerspective,
  } = useIOActionsContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { addTagsToFsEntry, removeTagsFromEntry } = useTaggingActionsContext();
  const { findLocation, readOnlyMode } = useCurrentLocationContext();
  const { showNotification } = useNotificationContext();

  const dirProps = useRef<TS.DirProp>(undefined);
  const fileNameRef = useRef<HTMLInputElement>(null);
  const sharingLinkRef = useRef<HTMLInputElement>(null);
  const disableConfirmButton = useRef<boolean>(true);
  const fileNameError = useRef<boolean>(false);
  const location = findLocation(openedEntry.locationID);

  const entryName = openedEntry
    ? openedEntry.isFile
      ? extractFileName(openedEntry.path, location?.getDirSeparator())
      : extractDirectoryName(openedEntry.path, location?.getDirSeparator())
    : '';

  const [editName, setEditName] = useState<string>(undefined);
  const [isMoveCopyFilesDialogOpened, setMoveCopyFilesDialogOpened] =
    useState<boolean>(false);
  const [isConfirmResetColorDialogOpened, setConfirmResetColorDialogOpened] =
    useState<boolean>(false);
  const [isFileThumbChooseDialogOpened, setFileThumbChooseDialogOpened] =
    useState<boolean>(false);
  const [showSharingLinkDialog, setShowSharingLinkDialog] =
    useState<boolean>(false);
  const [isBgndImgChooseDialogOpened, setBgndImgChooseDialogOpened] =
    useState<boolean>(false);
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  const backgroundImage = useRef<string>('none');
  const thumbImage = useRef<string>('none');

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  const [popoverAnchorEl, setPopoverAnchorEl] =
    React.useState<HTMLElement | null>(null);

  const popoverOpen = Boolean(popoverAnchorEl);
  const popoverId = popoverOpen ? 'popoverBackground' : undefined;

  const handlePopeverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };

  useEffect(() => {
    reloadBackground();
    reloadThumbnails();
  }, [location]);

  useEffect(() => {
    if (!firstRender && metaActions && metaActions.length > 0 && openedEntry) {
      for (const action of metaActions) {
        if (action.action === 'bgdImgChange') {
          reloadBackground(); //todo rethink this duplicate from openedEntry changes
        } else if (action.action === 'thumbChange') {
          reloadThumbnails();
        }
      }
    }
  }, [metaActions, openedEntry]);

  function reloadBackground() {
    if (location) {
      location
        .getFolderBgndPath(openedEntry.path, openedEntry.meta?.lastUpdated)
        .then((bgPath) => {
          const bgImage = bgPath ? 'url("' + bgPath + '")' : 'none';
          if (bgImage !== backgroundImage.current) {
            backgroundImage.current = bgImage;
            forceUpdate();
          }
        });
    }
  }

  function reloadThumbnails() {
    if (location) {
      location
        .getThumbPath(
          openedEntry.meta?.thumbPath,
          openedEntry.meta?.lastUpdated,
        )
        .then((thumbPath) => {
          const thbImage = thumbPath ? 'url("' + thumbPath + '")' : 'none';
          if (thbImage !== thumbImage.current) {
            thumbImage.current = thbImage;
            forceUpdate();
          }
        });
    }
  }

  useEffect(() => {
    if (editName === entryName && fileNameRef.current) {
      fileNameRef.current.focus();
    }
  }, [editName]);

  const renameEntry = () => {
    if (editName !== undefined) {
      const dirSeparator = location?.getDirSeparator();
      const path = extractContainingDirectoryPath(
        openedEntry.path,
        dirSeparator,
      );
      const nextPath =
        (path && path !== dirSeparator ? path + dirSeparator : '') + editName;

      if (openedEntry.isFile) {
        renameFile(openedEntry.path, nextPath, openedEntry.locationID).catch(
          () => {
            fileNameRef.current.value = entryName;
          },
        );
      } else {
        renameDirectory(
          openedEntry.path,
          editName,
          openedEntry.locationID,
        ).catch(() => {
          fileNameRef.current.value = entryName;
        });
      }

      setEditName(undefined);
    }
  };

  const activateEditNameField = () => {
    if (readOnlyMode) {
      setEditName(undefined);
      return;
    }
    setEditName(entryName);
  };

  const deactivateEditNameField = () => {
    setEditName(undefined);
    fileNameError.current = false;
    if (fileNameRef) {
      fileNameRef.current.value = entryName;
    }
  };

  const toggleMoveCopyFilesDialog = () => {
    setMoveCopyFilesDialogOpened(!isMoveCopyFilesDialogOpened);
  };

  const toggleThumbFilesDialog = () => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (!isEditMode && editName === undefined) {
      setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    }
  };

  const toggleBgndImgDialog = () => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (!isEditMode && editName === undefined) {
      setBgndImgChooseDialogOpened(!isBgndImgChooseDialogOpened);
    }
  };

  const fileSize = () => {
    if (openedEntry.isFile) {
      return formatBytes(openedEntry.size);
    } else if (dirProps.current) {
      return formatBytes(dirProps.current.totalSize);
    }
    return t(location?.haveObjectStoreSupport() ? 'core:notAvailable' : '?');
  };

  const toggleBackgroundColorPicker = () => {
    if (readOnlyMode) {
      return;
    }
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChangeColor = (color) => {
    if (color === 'transparent0') {
      // eslint-disable-next-line no-param-reassign
      color = 'transparent';
    }
    //openedEntry.color = color;
    setBackgroundColorChange(openedEntry, color).then(() => {
      openedEntry.meta = { ...openedEntry.meta, color };
    });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'name') {
      const initValid = disableConfirmButton.current;
      let noValid;
      if (openedEntry.isFile) {
        noValid = fileNameValidation(value);
      } else {
        noValid = dirNameValidation(value);
      }
      disableConfirmButton.current = noValid;
      if (noValid || initValid !== noValid) {
        fileNameError.current = noValid;
      }
      setEditName(value);
    }
  };

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    if (action === 'remove-value') {
      if (!value) {
        // no tags left in the select element
        return removeTagsFromEntry(openedEntry);
      } else {
        return removeTagsFromEntry(openedEntry, value);
      }
    } else if (action === 'clear') {
      return removeTagsFromEntry(openedEntry);
    }
    // create-option or select-option
    const tags =
      openedEntry.tags === undefined
        ? value
        : value.filter(
            (tag) => !openedEntry.tags.some((obj) => obj.title === tag.title),
          );
    return addTagsToFsEntry(openedEntry, tags);
  };

  if (!openedEntry || !openedEntry.path || openedEntry.path === '') {
    return <div />;
  }

  const ldtm = openedEntry.lmdt
    ? new Date(openedEntry.lmdt)
        .toISOString()
        .substring(0, 19)
        .split('T')
        .join(' ')
    : ' ';

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    openedEntry.meta = {
      ...(openedEntry.meta && openedEntry.meta),
      perspective,
    };
    saveDirectoryPerspective(openedEntry, perspective, openedEntry.locationID);
  };

  let perspectiveDefault;
  if (openedEntry.meta && openedEntry.meta.perspective) {
    perspectiveDefault = openedEntry.meta.perspective; // props.perspective;
  } else {
    perspectiveDefault = 'unspecified'; // perspectives.DEFAULT;
  }

  // https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Icon.Default.js#L22
  const iconFileMarker = new L.Icon({
    iconUrl: MarkerIcon,
    iconRetinaUrl: Marker2xIcon,
    shadowUrl: MarkerShadowIcon,
    tooltipAnchor: [16, -28],
    iconSize: [25, 41], // size of the icon
    shadowSize: [41, 41], // size of the shadow
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [5, 41], // the same for the shadow
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
  });

  function getGeoLocation(tags: Array<TS.Tag>) {
    if (!Pro) {
      return;
    }
    if (tags) {
      for (let i = 0; i < tags.length; i += 1) {
        const location = parseGeoLocation(tags[i].title);
        if (location !== undefined) {
          return location;
        }
      }
    }
  }

  const geoLocation: any = getGeoLocation(
    openedEntry.isFile ? openedEntry.tags : openedEntry.meta?.tags,
  );

  const isCloudLocation = openedEntry.url && openedEntry.url.length > 5;

  const showLinkForDownloading =
    isCloudLocation && openedEntry.isFile && !openedEntry.isEncrypted;

  return (
    <div>
      <Grid container>
        <Grid size={12}>
          <TsTextField
            error={fileNameError.current}
            label={
              openedEntry.isFile ? t('core:fileName') : t('core:folderName')
            }
            slotProps={{
              input: {
                readOnly: editName === undefined,
                endAdornment: (
                  <InputAdornment position="end">
                    {!readOnlyMode && !isEditMode && (
                      <div style={{ textAlign: 'right' }}>
                        {editName !== undefined ? (
                          <div>
                            <TsButton
                              data-tid="cancelRenameEntryTID"
                              onClick={deactivateEditNameField}
                              variant="text"
                            >
                              {t('core:cancel')}
                            </TsButton>
                            <TsButton
                              data-tid="confirmRenameEntryTID"
                              onClick={renameEntry}
                              variant="text"
                              disabled={disableConfirmButton.current}
                            >
                              {t('core:confirmSaveButton')}
                            </TsButton>
                          </div>
                        ) : (
                          <TsButton
                            data-tid="startRenameEntryTID"
                            variant="text"
                            onClick={activateEditNameField}
                          >
                            {t('core:rename')}
                          </TsButton>
                        )}
                      </div>
                    )}
                  </InputAdornment>
                ),
              },
            }}
            name="name"
            data-tid="fileNameProperties"
            defaultValue={entryName}
            inputRef={fileNameRef}
            retrieveValue={() => fileNameRef.current.value}
            onClick={() => {
              if (!isEditMode && editName === undefined) {
                activateEditNameField();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !fileNameError.current) {
                renameEntry();
              }
            }}
            onChange={handleFileNameChange}
          />
          {fileNameError.current && (
            <FormHelperText style={{ marginTop: 0 }}>
              {t(
                'core:' +
                  (openedEntry.isFile ? 'fileNameHelp' : 'directoryNameHelp'),
              )}
            </FormHelperText>
          )}
        </Grid>
        <Grid size={12}>
          <TagDropContainer entry={openedEntry}>
            <TagsSelect
              label={t('core:fileTags')}
              dataTid="PropertiesTagsSelectTID"
              placeholderText={t('core:dropHere')}
              tags={getAllTags(openedEntry)}
              tagMode="default"
              handleChange={handleChange}
              selectedEntry={openedEntry}
              autoFocus={true}
              generateButton={true}
            />
          </TagDropContainer>
        </Grid>

        {geoLocation && (
          <Grid size={12}>
            <MapContainer
              style={{
                height: '200px',
                width: '99%',
                margin: 2,
                marginTop: 8,
                borderRadius: AppConfig.defaultCSSRadius,
                // border: '1px solid rgba(0, 0, 0, 0.38)',
              }}
              doubleClickZoom={true}
              keyboard={false}
              dragging={true}
              center={geoLocation}
              zoom={13}
              scrollWheelZoom={false}
              zoomControl={true}
              attributionControl={false}
            >
              {props.tileServer ? (
                <TileLayer
                  attribution={props.tileServer.serverInfo}
                  url={props.tileServer.serverURL}
                />
              ) : (
                <NoTileServer />
              )}
              <LayerGroup>
                <Marker
                  icon={iconFileMarker}
                  position={[geoLocation.lat, geoLocation.lng]}
                >
                  <Popup>
                    <Typography
                      style={{ margin: 0, color: theme.palette.text.primary }}
                    >
                      {t('core:lat') + ' : ' + geoLocation.lat}
                      <br />
                      {t('core:lat') + ' : ' + geoLocation.lng}
                    </Typography>
                    <br />
                    <p>
                      <TsButton
                        onClick={() => {
                          openUrl(
                            'https://www.openstreetmap.org/?mlat=' +
                              geoLocation.lat +
                              '&mlon=' +
                              geoLocation.lng +
                              '#map=14/' +
                              geoLocation.lat +
                              '/' +
                              geoLocation.lng,
                          );
                        }}
                        title="Open in OpenStreetMap"
                      >
                        Open in
                        <br />
                        OpenStreetMap
                      </TsButton>
                      <TsButton
                        style={{
                          marginLeft: AppConfig.defaultSpaceBetweenButtons,
                        }}
                        onClick={() => {
                          openUrl(
                            'https://maps.google.com/?q=' +
                              geoLocation.lat +
                              ',' +
                              geoLocation.lng +
                              '&ll=' +
                              geoLocation.lat +
                              ',' +
                              geoLocation.lng +
                              '&z=15',
                          );
                        }}
                      >
                        Open in
                        <br />
                        Google Maps
                      </TsButton>
                    </p>
                  </Popup>
                </Marker>
              </LayerGroup>
              <AttributionControl position="bottomright" prefix="" />
            </MapContainer>
          </Grid>
        )}

        <Grid size={12}>
          <TsTextField
            value={ldtm}
            label={t('core:fileLDTM')}
            retrieveValue={() => ldtm}
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={12}>
          <Tooltip
            title={
              !location?.haveObjectStoreSupport() &&
              dirProps.current &&
              !openedEntry.isFile &&
              dirProps.current.dirsCount +
                ' ' +
                t('core:directories') +
                ', ' +
                dirProps.current.filesCount +
                ' ' +
                t('core:files')
            }
          >
            <TsTextField
              value={fileSize()}
              retrieveValue={() => fileSize()}
              label={t('core:fileSize')}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SizeIcon />
                    </InputAdornment>
                  ),
                  ...(!openedEntry.isFile && {
                    endAdornment: (
                      <TsButton
                        variant="text"
                        onClick={() =>
                          getOpenedDirProps().then((props) => {
                            dirProps.current = props;
                            forceUpdate();
                          })
                        }
                      >
                        {t('core:calculate')}
                      </TsButton>
                    ),
                  }),
                },
              }}
            />
          </Tooltip>
        </Grid>

        <Grid size={12}>
          <FormControl fullWidth={true}>
            <TsTextField
              name="path"
              title={openedEntry.url || openedEntry.path}
              label={isCloudLocation ? t('cloudPath') : t('core:filePath')}
              data-tid="filePathProperties"
              value={openedEntry.path || ''}
              retrieveValue={() => openedEntry.path}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      {isCloudLocation ? (
                        <CloudLocationIcon
                          style={{ color: theme.palette.text.secondary }}
                        />
                      ) : (
                        <LocalLocationIcon
                          style={{ color: theme.palette.text.secondary }}
                        />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {!readOnlyMode &&
                        !isEditMode &&
                        editName === undefined && (
                          <TsButton
                            data-tid="moveCopyEntryTID"
                            onClick={toggleMoveCopyFilesDialog}
                            variant="text"
                          >
                            {t('core:move')}
                          </TsButton>
                        )}
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
        </Grid>

        <Grid size={12}>
          <TsTextField
            data-tid="sharingLinkTID"
            name="sharinglink"
            label={<>{t('core:sharingLink')}</>}
            value={sharingLink}
            inputRef={sharingLinkRef}
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <OpenLinkIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <TsButton
                      tooltip={t('core:copyLinkToClipboard')}
                      data-tid="copyLinkToClipboardTID"
                      variant="text"
                      onClick={() => {
                        const entryTitle = extractTitle(
                          openedEntry.name,
                          !openedEntry.isFile,
                          location?.getDirSeparator(),
                        );
                        const clibboardItem = generateClipboardLink(
                          sharingLink,
                          entryTitle,
                        );
                        const promise =
                          navigator.clipboard.write(clibboardItem);
                        showNotification(t('core:linkCopied'));
                      }}
                    >
                      {t('core:copy')}
                    </TsButton>
                    <InfoIcon tooltip={t('core:sharingLinkTooltip')} />
                  </InputAdornment>
                ),
              },
            }}
          />
          {showLinkForDownloading && (
            <Grid size={12}>
              <TsTextField
                name="downloadLink"
                label={<>{t('core:downloadLink')}</>}
                value={' '}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <TsButton
                          tooltip={t('core:generateDownloadLink')}
                          onClick={() => setShowSharingLinkDialog(true)}
                          variant="text"
                        >
                          {t('core:generateDownloadLink')}
                        </TsButton>
                        <InfoIcon tooltip={t('core:downloadLinkTooltip')} />
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          )}
        </Grid>

        {!openedEntry.isFile && (
          <Grid size={12}>
            <PerspectiveSelector
              onChange={changePerspective}
              defaultValue={perspectiveDefault}
              label={t('core:choosePerspective')}
              testId="changePerspectiveTID"
            />
          </Grid>
        )}
        {!openedEntry.isFile && (
          <Grid size={12} style={{ marginTop: 5 }}>
            <TsTextField
              name="path"
              label={<>{t('core:backgroundColor')}</>}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <TransparentBackground>
                        <TsButton
                          tooltip={t('editBackgroundColor')}
                          fullWidth
                          style={{
                            width: 160,
                            height: 25,
                            background: openedEntry.meta?.color,
                            border: '1px solid lightgray',
                          }}
                          onClick={toggleBackgroundColorPicker}
                        >
                          &nbsp;
                        </TsButton>
                      </TransparentBackground>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box>
                        <ProTooltip tooltip={t('changeBackgroundColor')}>
                          <TsIconButton
                            data-tid="changeBackgroundColorTID"
                            aria-describedby={popoverId}
                            onClick={handlePopeverClick}
                            disabled={!Pro}
                          >
                            <ColorPaletteIcon />
                          </TsIconButton>
                        </ProTooltip>
                        <Popover
                          open={popoverOpen}
                          onClose={handlePopoverClose}
                          anchorEl={popoverAnchorEl}
                          id={popoverId}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                          }}
                        >
                          <Box style={{ padding: 10 }}>
                            {defaultBackgrounds.map((background, cnt) => (
                              <>
                                <TsIconButton
                                  key={cnt}
                                  data-tid={'backgroundTID' + cnt}
                                  aria-label="changeFolderBackround"
                                  onClick={() => {
                                    handleChangeColor(background);
                                    handlePopoverClose();
                                  }}
                                  style={{
                                    backgroundColor: background,
                                    backgroundImage: background,
                                    margin: 5,
                                  }}
                                >
                                  <SetColorIcon />
                                </TsIconButton>
                                {cnt % 4 === 3 && <br />}
                              </>
                            ))}
                          </Box>
                        </Popover>
                      </Box>
                      {openedEntry.meta && openedEntry.meta.color && (
                        <>
                          <ProTooltip tooltip={t('clearFolderColor')}>
                            <TsIconButton
                              data-tid={'backgroundClearTID'}
                              disabled={!Pro}
                              aria-label="clear"
                              onClick={() =>
                                setConfirmResetColorDialogOpened(true)
                              }
                            >
                              <ClearColorIcon />
                            </TsIconButton>
                          </ProTooltip>
                        </>
                      )}
                      <InfoIcon
                        tooltip={t(
                          'The background color will not be visible if you have set a background image',
                        )}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        )}
        <Grid container spacing={1} size={12}>
          <Grid size={openedEntry.isFile ? 12 : 6}>
            <FormHelperText>{t('core:thumbnail')}</FormHelperText>
            <ThumbnailTextField
              margin="dense"
              variant="outlined"
              style={{ marginTop: 0 }}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="end">
                      <Stack
                        direction="column"
                        spacing={0}
                        style={{ alignItems: 'center' }}
                      >
                        {!readOnlyMode &&
                          !isEditMode &&
                          editName === undefined && (
                            <ProTooltip tooltip={t('changeThumbnail')}>
                              <TsButton
                                data-tid="changeThumbnailTID"
                                fullWidth
                                variant="text"
                                onClick={toggleThumbFilesDialog}
                              >
                                {t('core:change')}
                              </TsButton>
                            </ProTooltip>
                          )}
                        <div
                          role="button"
                          tabIndex={0}
                          style={{
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundImage: thumbImage.current,
                            backgroundPosition: 'center',
                            borderRadius: AppConfig.defaultCSSRadius,
                            minHeight: 150,
                            minWidth: 150,
                            marginBottom: 5,
                          }}
                          onClick={toggleThumbFilesDialog}
                        />
                      </Stack>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          {!openedEntry.isFile && (
            <Grid size={6}>
              <FormHelperText>{t('core:backgroundImage')}</FormHelperText>
              <ThumbnailTextField
                margin="dense"
                fullWidth
                style={{
                  marginTop: 0,
                }}
                variant="outlined"
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="end">
                        <Stack
                          direction="column"
                          spacing={0}
                          style={{ alignItems: 'center' }}
                        >
                          {!readOnlyMode &&
                            !isEditMode &&
                            editName === undefined && (
                              <ProTooltip tooltip={t('changeBackgroundImage')}>
                                <TsButton
                                  data-tid="changeBackgroundImageTID"
                                  fullWidth
                                  variant="text"
                                  onClick={toggleBgndImgDialog}
                                >
                                  {t('core:change')}
                                </TsButton>
                              </ProTooltip>
                            )}
                          <div
                            data-tid="propsBgnImageTID"
                            role="button"
                            tabIndex={0}
                            style={{
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat',
                              backgroundImage: backgroundImage.current,
                              backgroundPosition: 'center',
                              borderRadius: AppConfig.defaultCSSRadius,
                              minHeight: 150,
                              minWidth: 150,
                              marginBottom: 5,
                            }}
                            onClick={toggleBgndImgDialog}
                          />
                        </Stack>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          )}
        </Grid>
        <Grid size={12}>
          <TsTextField
            data-tid="entryIDTID"
            name="entryid"
            label={t('core:entryId')}
            value={openedEntry?.meta?.id}
            retrieveValue={() => openedEntry?.meta?.id}
            slotProps={{
              input: {
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <IDIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <TsButton
                      tooltip={t('core:copyIdToClipboard')}
                      data-tid="copyIdToClipboardTID"
                      variant="text"
                      disabled={!openedEntry?.meta?.id}
                      onClick={() => {
                        const entryId = openedEntry?.meta?.id;
                        if (entryId) {
                          const clibboardItem = generateClipboardLink(
                            entryId,
                            entryId,
                          );
                          const promise =
                            navigator.clipboard.write(clibboardItem);
                          showNotification(t('core:entryIdCopied'));
                        }
                      }}
                    >
                      {t('core:copy')}
                    </TsButton>
                    <InfoIcon tooltip={t('core:entryIdTooltip')} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
      </Grid>
      {isConfirmResetColorDialogOpened && (
        <ConfirmDialog
          open={isConfirmResetColorDialogOpened}
          onClose={() => {
            setConfirmResetColorDialogOpened(false);
          }}
          title={t('core:confirm')}
          content={t('core:confirmResetColor')}
          confirmCallback={(result) => {
            if (result) {
              handleChangeColor('transparent');
            } else {
              setConfirmResetColorDialogOpened(false);
            }
          }}
          cancelDialogTID="cancelConfirmResetColorDialog"
          confirmDialogTID="confirmConfirmResetColorDialog"
          confirmDialogContentTID="confirmResetColorDialogContent"
        />
      )}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          key={getUuid()}
          open={isMoveCopyFilesDialogOpened}
          onClose={toggleMoveCopyFilesDialog}
          entries={[
            {
              ...openedEntry,
              isFile: openedEntry.isFile,
              name: entryName,
              tags: [],
            },
          ]}
        />
      )}
      {ThumbnailChooserDialog && (
        <ThumbnailChooserDialog
          open={isFileThumbChooseDialogOpened}
          onClose={toggleThumbFilesDialog}
          entry={openedEntry as TS.FileSystemEntry}
        />
      )}
      {showSharingLinkDialog && (
        <LinkGeneratorDialog
          open={showSharingLinkDialog}
          onClose={() => setShowSharingLinkDialog(false)}
        />
      )}
      {BgndImgChooserDialog && (
        <BgndImgChooserDialog
          open={isBgndImgChooseDialogOpened}
          onClose={toggleBgndImgDialog}
          entry={openedEntry as TS.FileSystemEntry}
        />
      )}
      {CustomBackgroundDialog && (
        <CustomBackgroundDialog
          color={openedEntry.meta?.color}
          open={displayColorPicker}
          setColor={handleChangeColor}
          onClose={toggleBackgroundColorPicker}
          currentDirectoryPath={openedEntry.path}
        />
      )}
    </div>
  );
}

export default EntryProperties;
