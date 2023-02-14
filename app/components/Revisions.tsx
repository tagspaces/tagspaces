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

import React, { useEffect, useState } from 'react';
import {
  getBackupFileLocation,
  extractContainingDirectoryPath
} from '@tagspaces/tagspaces-common/paths';
import withStyles from '@mui/styles/withStyles';
import {
  actions as AppActions,
  getOpenedFiles,
  OpenedEntry
} from '-/reducers/app';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import { format, formatDistanceToNow } from 'date-fns';
import i18n from '-/services/i18n';
import { bindActionCreators } from 'redux';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from '@mui/material/IconButton';
import AppConfig from '-/AppConfig';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { Pro } from '-/pro';
import FilePreviewDialog from '-/components/dialogs/FilePreviewDialog';

interface Props {
  // openedFile: OpenedEntry;
  openedFiles: Array<OpenedEntry>;
  openEntry: (path: string) => void;
  theme: any;
}

function Revisions(props: Props) {
  const [rows, setRows] = useState<Array<TS.FileSystemEntry>>();
  const [page, setPage] = React.useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(5);
  const [previewDialogEntry, setPreviewDialogEntry] = useState<
    TS.FileSystemEntry
  >(undefined);
  const { openedFiles, theme } = props;
  // const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // if no history item path - not loadHistoryItems for items in metaFolder
    const openedFile = openedFiles[0];
    if (openedFile && openedFile.path.indexOf(AppConfig.metaFolder) === -1) {
      loadHistoryItems(openedFile);
    }
  }, [openedFiles]);

  function loadHistoryItems(openedFile: OpenedEntry) {
    Pro.MetaOperations.getMetadataID(openedFile.path, openedFile.uuid).then(
      id => {
        openedFile.uuid = id;
        const backupFilePath = getBackupFileLocation(
          openedFile.path,
          openedFile.uuid,
          PlatformIO.getDirSeparator()
        );
        const backupPath = extractContainingDirectoryPath(
          backupFilePath,
          PlatformIO.getDirSeparator()
        );
        PlatformIO.listDirectoryPromise(backupPath, []).then(h =>
          setRows(h.sort((a, b) => (a.lmdt < b.lmdt ? 1 : -1)))
        );
      }
    );
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  function restoreRevision(revisionPath) {
    const openedFile = openedFiles[0];
    const targetPath = getBackupFileLocation(
      openedFile.path,
      openedFile.uuid,
      PlatformIO.getDirSeparator()
    );
    PlatformIO.copyFilePromiseOverwrite(openedFile.path, targetPath).then(
      () => {
        PlatformIO.copyFilePromiseOverwrite(
          revisionPath,
          openedFile.path
        ).then(() => props.openEntry(openedFile.path)); // loadHistoryItems(openedFile));
      }
    );
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  /*const emptyRows =
    rows && page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;*/

  return (
    <div>
      <h2>{i18n.t('revisions')}</h2>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="revisions table">
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell align="right">Revision Date</TableCell>
              <TableCell align="right">Review/Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows &&
              rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => (
                  <TableRow
                    key={row.path}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell
                      align="right"
                      title={format(row.lmdt, 'dd.MM.yyyy HH:mm:ss')}
                    >
                      {formatDistanceToNow(row.lmdt, {
                        includeSeconds: true,
                        addSuffix: true
                        // locale: https://date-fns.org/v2.29.3/docs/formatDistanceToNow#usage
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label={i18n.t('core:view')}
                        onClick={() => setPreviewDialogEntry(row)}
                        data-tid="viewRevisionTID"
                        size="large"
                      >
                        <PreviewIcon color="primary" />
                      </IconButton>
                      <IconButton
                        aria-label={i18n.t('core:restore')}
                        onClick={() => restoreRevision(row.path)}
                        data-tid="restoreRevisionTID"
                        size="large"
                      >
                        <RestoreIcon color="primary" />
                      </IconButton>
                      <IconButton
                        aria-label={i18n.t('core:delete')}
                        onClick={() => {
                          PlatformIO.deleteFilePromise(
                            row.path,
                            true
                          ).then(() => loadHistoryItems(openedFiles[0]));
                        }}
                        data-tid="deleteRevisionTID"
                        size="large"
                      >
                        <DeleteIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            {/*{emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}*/}
          </TableBody>
        </Table>
      </TableContainer>
      {rows && rowsPerPage < rows.length && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      <FilePreviewDialog
        fsEntry={previewDialogEntry}
        open={previewDialogEntry !== undefined}
        onClose={() => setPreviewDialogEntry(undefined)}
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    language: getCurrentLanguage(state),
    openedFiles: getOpenedFiles(state)
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
)(withStyles(undefined, { withTheme: true })(Revisions));
