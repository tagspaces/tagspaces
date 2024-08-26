import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import {
  ParentFolderIcon,
  NewFolderIcon,
  FolderOutlineIcon as FolderIcon,
} from '-/components/CommonIcons';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import Typography from '@mui/material/Typography';
import { CommonLocation } from '-/utils/CommonLocation';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';

interface Props {
  setTargetDir: (dirPath: string) => void;
  currentDirectoryPath?: string;
}
function DirectoryListView(props: Props) {
  const { currentDirectoryPath, setTargetDir } = props;
  const { t } = useTranslation();
  const { currentLocation, findLocation, locations } =
    useCurrentLocationContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const showUnixHiddenEntries: boolean = useSelector(getShowUnixHiddenEntries);
  const chosenLocationId = useRef<string>(
    currentLocation ? currentLocation.uuid : undefined,
  );
  const chosenDirectory = useRef<string>(currentDirectoryPath);
  const [directoryContent, setDirectoryContent] = useState<
    TS.FileSystemEntry[]
  >([]);

  useEffect(() => {
    const chosenLocation = findLocation(chosenLocationId.current);
    if (chosenLocation) {
      const path =
        currentLocation &&
        chosenLocation.uuid === currentLocation.uuid &&
        currentDirectoryPath
          ? currentDirectoryPath
          : chosenLocation.path;
      listDirectory(path);
    }
  }, [chosenLocationId.current]);

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    chosenLocationId.current = event.target.value;
    const chosenLocation = findLocation(chosenLocationId.current);
    if (chosenLocation) {
      listDirectory(chosenLocation.path);
      setTargetDir(chosenLocation.path);
    }
  };

  function getDirLocations() {
    const chosenLocation = findLocation(chosenLocationId.current);
    if (chosenLocation.type !== locationType.TYPE_LOCAL) {
      return null;
    }
    return (
      <FormControl
        fullWidth
        variant="standard"
        style={{
          flexFlow: 'nowrap',
          alignItems: 'center',
        }}
      >
        <Typography style={{ display: 'inline' }} variant="subtitle2">
          {t('location')}:&nbsp;
        </Typography>
        <Select
          fullWidth
          style={{ display: 'inline' }}
          onChange={handleLocationChange}
          value={chosenLocationId.current}
        >
          {locations
            .filter((loc) => loc.type === locationType.TYPE_LOCAL)
            .map((location: CommonLocation) => (
              <MenuItem key={location.uuid} value={location.uuid}>
                <span style={{ width: '100%' }}>{location.name}</span>
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    );
  }

  function listDirectory(directoryPath) {
    chosenDirectory.current = directoryPath;
    currentLocation
      .listDirectoryPromise(
        directoryPath,
        [], // mode,
        [],
      )
      .then((results) => {
        if (results !== undefined) {
          setDirectoryContent(
            results.filter((entry) => {
              return (
                !entry.isFile &&
                entry.name !== AppConfig.metaFolder &&
                !entry.name.endsWith('/' + AppConfig.metaFolder) &&
                !(!showUnixHiddenEntries && entry.name.startsWith('.'))
              );
            }),
            // .sort((a, b) => b.name - a.name)
          );
          // props.setTargetDir(directoryPath);
        }
        return true;
      })
      .catch((error) => {
        console.log('listDirectoryPromise', error);
      });
  }

  function getFolderContent() {
    if (directoryContent && directoryContent.length > 0) {
      return directoryContent.map((entry) => (
        <ListItem
          key={entry.path}
          data-tid={'MoveTarget' + entry.name}
          title={'Navigate to: ' + entry.path}
          onClick={() => {
            setTargetDir(entry.path);
          }}
          onDoubleClick={() => {
            listDirectory(entry.path);
          }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={entry.name} />
        </ListItem>
      ));
    }
    return <div style={{ padding: 10 }}>{t('core:noSubFoldersFound')}</div>;
  }

  return (
    <div style={{ marginTop: 10 }}>
      {getDirLocations()}
      <Button
        variant="text"
        startIcon={<ParentFolderIcon />}
        style={{ margin: 5 }}
        data-tid="navigateToParentTID"
        onClick={() => {
          if (chosenDirectory.current) {
            let currentPath = chosenDirectory.current;
            if (currentPath.endsWith(currentLocation?.getDirSeparator())) {
              currentPath = currentPath.slice(0, -1);
            }
            const parentDir = extractContainingDirectoryPath(currentPath);
            listDirectory(parentDir);
            setTargetDir(parentDir);
          }
        }}
      >
        {t('core:navigateToParentDirectory')}
      </Button>
      <Button
        variant="text"
        startIcon={<NewFolderIcon />}
        style={{ margin: 5 }}
        data-tid="newSubdirectoryTID"
        onClick={() => {
          openCreateDirectoryDialog(chosenDirectory.current, (newDirPath) => {
            listDirectory(chosenDirectory.current);
            setTargetDir(newDirPath);
          });
          //reflect: false,
        }}
      >
        {t('core:newSubdirectory')}
      </Button>
      <List
        dense
        style={{
          borderRadius: 5,
          border: '1px solid gray',
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        {getFolderContent()}
      </List>
    </div>
  );
}

export default DirectoryListView;
