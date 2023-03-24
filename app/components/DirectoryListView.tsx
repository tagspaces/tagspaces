import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderIcon from '@mui/icons-material/FolderOpen';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { TS } from '-/tagspaces.namespace';
import { getCurrentLocationId } from '-/reducers/app';
import { ParentFolderIcon } from '-/components/CommonIcons';
import { getLocations } from '-/reducers/locations';
import PlatformIO from '-/services/platform-facade';

interface Props {
  setTargetDir: (dirPath: string) => void;
  locations: Array<TS.Location>;
  currentLocationId: string;
}
function DirectoryListView(props: Props) {
  const { locations, currentLocationId } = props;
  const chosenLocationId = useRef<string>(currentLocationId);
  const chosenDirectory = useRef<string>();
  const [directoryContent, setDirectoryContent] = useState<
    TS.FileSystemEntry[]
  >([]);

  useEffect(() => {
    const chosenLocation = locations.find(
      location => location.uuid === chosenLocationId.current
    );
    if (chosenLocation) {
      listDirectory(chosenLocation.path);
    }
  }, [chosenLocationId.current]);

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    chosenLocationId.current = event.target.value;
    const chosenLocation = locations.find(
      location => location.uuid === chosenLocationId.current
    );
    if (chosenLocation) {
      props.setTargetDir(chosenLocation.path);
      listDirectory(chosenLocation.path);
    }
  };

  function getLocations() {
    return (
      <Select
        onChange={handleLocationChange}
        fullWidth
        value={chosenLocationId.current}
      >
        {locations
          .filter(loc => loc.type === locationType.TYPE_LOCAL)
          .map((location: TS.Location) => (
            <MenuItem key={location.uuid} value={location.uuid}>
              <span style={{ width: '100%' }}>{location.name}</span>
            </MenuItem>
          ))}
      </Select>
    );
  }

  function listDirectory(directoryPath) {
    chosenDirectory.current = directoryPath;
    PlatformIO.listDirectoryPromise(
      directoryPath,
      [], // mode,
      []
    )
      .then(results => {
        if (results !== undefined) {
          setDirectoryContent(results.filter(entry => !entry.isFile));
        }
        return true;
      })
      .catch(error => {
        console.error('listDirectoryPromise', error);
      });
  }

  function getFolderContent() {
    if (directoryContent && directoryContent.length > 0) {
      return directoryContent.map(entry => (
        <ListItem
          title={'Navigate to: ' + entry.path}
          style={{ maxWidth: 250 }}
          onClick={() => {
            props.setTargetDir(entry.path);
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
    return (
      <div style={{ padding: 10 }}>{i18n.t('core:noSubFoldersFound')}</div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      {getLocations()}
      <List
        dense
        style={{
          borderRadius: 5,
          maxHeight: 400,
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <ListItem
          title={i18n.t('core:navigateToParentDirectory')}
          style={{ maxWidth: 250 }}
          button
          onClick={() => {
            listDirectory(
              extractContainingDirectoryPath(chosenDirectory.current)
            );
          }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <ParentFolderIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:navigateToParentDirectory')} />
        </ListItem>
        {getFolderContent()}
      </List>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentLocationId: getCurrentLocationId(state)
  };
}

export default connect(mapStateToProps)(DirectoryListView);
