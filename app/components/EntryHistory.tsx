/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { useEffect, useReducer, useState } from 'react';
import {
  getBackupFileLocation,
  extractContainingDirectoryPath
} from '@tagspaces/tagspaces-common/paths';
import withStyles from '@mui/styles/withStyles';
import { actions as AppActions, OpenedEntry } from '-/reducers/app';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import { format } from 'date-fns';
import i18n from '-/services/i18n';
import { HistoryIcon } from '-/components/CommonIcons';
import Button from '@mui/material/Button';
import { bindActionCreators } from 'redux';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import AppConfig from '-/AppConfig';

interface Props {
  openedFile: OpenedEntry;
  openEntry: (path: string) => void;
  theme: any;
}

function EntryHistory(props: Props) {
  const [history, setHistory] = useState<Array<TS.FileSystemEntry>>();
  const { openedFile, theme, openEntry } = props;
  // const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // if no history item path - not loadHistoryItems for items in metaFolder
    if (openedFile.path.indexOf(AppConfig.metaFolder) === -1) {
      loadHistoryItems();
    }
  }, [openedFile]);

  function loadHistoryItems() {
    const backupFilePath = getBackupFileLocation(
      openedFile.path,
      openedFile.uuid,
      PlatformIO.getDirSeparator()
    );
    const backupPath = extractContainingDirectoryPath(
      backupFilePath,
      PlatformIO.getDirSeparator()
    );
    PlatformIO.listDirectoryPromise(backupPath, []).then(h => setHistory(h));
  }

  return (
    <div
      style={{
        /*width: '100%',
        height: '100%',
        flex: '1 1 100%',
        display: 'flex',*/
        backgroundColor: theme.palette.background.default
      }}
    >
      {history &&
        history.map(item => (
          <div>
            <Button
              onClick={() => openEntry(item.path)}
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<HistoryIcon />}
            >
              {format(item.lmdt, 'dd.MM.yyyy HH:mm:ss')}
            </Button>
            <IconButton
              aria-label={i18n.t('core:delete')}
              onClick={() => {
                PlatformIO.deleteFilePromise(item.path, true).then(() =>
                  loadHistoryItems()
                );
              }}
              data-tid="fileContainerToggleProperties"
              size="large"
            >
              <DeleteIcon color="primary" />
            </IconButton>
          </div>
        ))}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    language: getCurrentLanguage(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      openEntry: AppActions.openEntry
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(undefined, { withTheme: true })(EntryHistory));
