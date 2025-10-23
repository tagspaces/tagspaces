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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
    targetLocationID || currentLocation?.uuid,
  );
  const chosenDirectory = useRef<string>(targetPath);
  const [directoryContent, setDirectoryContent] = useState<
    TS.FileSystemEntry[]
  >(currentDirectoryEntries.filter((entry) => !entry.isFile));

  // List directory content and filter out unwanted entries
  const listDirectory = useCallback(
    (directoryPath: string) => {
      chosenDirectory.current = directoryPath;
      const location = findLocation(chosenLocationId.current);
      if (!location) return;
      location
        .listDirectoryPromise(directoryPath, [], [])
        .then((results) => {
          if (results !== undefined) {
            setDirectoryContent(
              results.filter(
                (entry) =>
                  !entry.isFile &&
                  entry.name !== AppConfig.metaFolder &&
                  !entry.name.endsWith('/' + AppConfig.metaFolder) &&
                  !(!showUnixHiddenEntries && entry.name.startsWith('.')),
              ),
            );
          }
        })
        .catch((error) => {
          console.error('listDirectoryPromise', error);
        });
    },
    [findLocation, showUnixHiddenEntries],
  );

  // On mount, if targetLocationID is different, list its directory
  useEffect(() => {
    if (targetLocationID && targetLocationID !== currentLocation?.uuid) {
      const chosenLocation = findLocation(chosenLocationId.current);
      if (chosenLocation) {
        listDirectory(targetPath);
      }
    }
    // eslint-disable-next-line
  }, []);

  // Handle location change from dropdown
  const handleLocationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      chosenLocationId.current = event.target.value;
      const chosenLocation = findLocation(chosenLocationId.current);
      if (chosenLocation) {
        listDirectory(chosenLocation.path);
        setTargetDir(chosenLocation.path);
      }
    },
    [findLocation, listDirectory, setTargetDir],
  );

  // Render location selector if local locations are available
  const dirLocations = useMemo(() => {
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
          fullWidth
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
  }, [findLocation, handleLocationChange, locations, t]);

  // Render folder content
  const folderContent = useMemo(() => {
    if (directoryContent && directoryContent.length > 0) {
      return directoryContent.map((entry) => (
        <ListItem
          key={entry.path}
          data-tid={'MoveTarget' + entry.name}
          title={'Navigate to: ' + entry.path}
          onClick={() => setTargetDir(entry.path)}
          onDoubleClick={() => listDirectory(entry.path)}
        >
          <ListItemIcon sx={{ minWidth: 35 }}>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={entry.name} />
        </ListItem>
      ));
    }
    return <Box sx={{ padding: '10px' }}>{t('core:noSubFoldersFound')}</Box>;
  }, [directoryContent, listDirectory, setTargetDir, t]);

  // Handler for navigating to parent directory
  const handleNavigateParent = useCallback(() => {
    if (chosenDirectory.current) {
      let currentPath = chosenDirectory.current;
      if (currentPath.endsWith(currentLocation?.getDirSeparator())) {
        currentPath = currentPath.slice(0, -1);
      }
      const parentDir = extractContainingDirectoryPath(currentPath);
      listDirectory(parentDir);
      setTargetDir(parentDir);
    }
  }, [currentLocation, listDirectory, setTargetDir]);

  // Handler for creating a new subdirectory
  const handleCreateSubdirectory = useCallback(() => {
    openCreateDirectoryDialog(
      chosenDirectory.current,
      (newDirPath) => {
        listDirectory(chosenDirectory.current);
        setTargetDir(newDirPath);
      },
      true,
    );
  }, [listDirectory, openCreateDirectoryDialog, setTargetDir]);

  return (
    <Box sx={{ marginTop: '10px' }}>
      {dirLocations}
      <TsButton
        startIcon={<ParentFolderIcon />}
        sx={{ marginTop: '10px', marginBottom: '10px' }}
        data-tid="navigateToParentTID"
        onClick={handleNavigateParent}
      >
        {t('core:navigateToParentDirectory')}
      </TsButton>
      <TsButton
        startIcon={<NewFolderIcon />}
        sx={{ marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}
        data-tid="newSubdirectoryTID"
        onClick={handleCreateSubdirectory}
      >
        {t('core:newSubdirectory')}
      </TsButton>
      <List
        dense
        sx={{
          borderRadius: AppConfig.defaultCSSRadius,
          border: '1px solid gray',
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        {folderContent}
      </List>
    </Box>
  );
};

export default React.memo(DirectoryListView);
