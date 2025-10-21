import AppConfig from '-/AppConfig';
import {
  FolderOutlineIcon as FolderIcon,
  NewFolderIcon,
  ParentFolderIcon,
} from '-/components/CommonIcons';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import TsButton from '-/components/TsButton';
import TsSelect from '-/components/TsSelect';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { Box } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  setTargetDir: (dirPath: string) => void;
  targetPath?: string;
  targetLocationID?: string;
}

const DirectoryListView: React.FC<Props> = ({
  targetPath,
  setTargetDir,
  targetLocationID,
}) => {
  const { t } = useTranslation();
  const { currentLocation, findLocation, locations } =
    useCurrentLocationContext();
  const { currentDirectoryEntries } = useDirectoryContentContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const showUnixHiddenEntries: boolean = useSelector(getShowUnixHiddenEntries);
  const chosenLocationId = useRef<string>(
    targetLocationID ? targetLocationID : currentLocation?.uuid,
  );
  const chosenDirectory = useRef<string>(targetPath);
  const [directoryContent, setDirectoryContent] = useState<
    TS.FileSystemEntry[]
  >(currentDirectoryEntries.filter((entry) => !entry.isFile));

  useEffect(() => {
    if (targetLocationID && targetLocationID !== currentLocation?.uuid) {
      const chosenLocation = findLocation(chosenLocationId.current);
      if (chosenLocation) {
        listDirectory(targetPath);
      }
    }
  }, []);

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
    if (!chosenLocation || chosenLocation.type !== locationType.TYPE_LOCAL) {
      return null;
    }
    return (
      <FormControl
        fullWidth
        variant="standard"
        sx={{
          flexFlow: 'nowrap',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ display: 'inline' }} variant="subtitle2">
          {t('targetLocation')}:&nbsp;
        </Typography>
        <TsSelect
          fullWidth={true}
          onChange={handleLocationChange}
          value={chosenLocationId.current}
        >
          {locations
            .filter((loc) => loc.type === locationType.TYPE_LOCAL)
            .map((location: CommonLocation) => (
              <MenuItem key={location.uuid} value={location.uuid}>
                <Box sx={{ width: '100%' }}>{location.name}</Box>
              </MenuItem>
            ))}
        </TsSelect>
      </FormControl>
    );
  }

  function listDirectory(directoryPath) {
    chosenDirectory.current = directoryPath;
    findLocation(chosenLocationId.current)
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
    <Box sx={{ marginTop: '10px' }}>
      {getDirLocations()}
      <TsButton
        startIcon={<ParentFolderIcon />}
        style={{ marginTop: 10, marginBottom: 10 }}
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
      </TsButton>
      <TsButton
        startIcon={<NewFolderIcon />}
        sx={{ marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}
        data-tid="newSubdirectoryTID"
        onClick={() => {
          openCreateDirectoryDialog(
            chosenDirectory.current,
            (newDirPath) => {
              listDirectory(chosenDirectory.current);
              setTargetDir(newDirPath);
            },
            true,
          );
          //reflect: false,
        }}
      >
        {t('core:newSubdirectory')}
      </TsButton>
      <List
        dense
        style={{
          borderRadius: AppConfig.defaultCSSRadius,
          border: '1px solid gray',
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        {getFolderContent()}
      </List>
    </Box>
  );
};

export default DirectoryListView;
