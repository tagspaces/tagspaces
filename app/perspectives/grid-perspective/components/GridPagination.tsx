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

import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Pagination from '@material-ui/lab/Pagination';
import i18n from '-/services/i18n';
import {
  getCurrentDirectoryColor,
  getSearchResultCount,
  isLoading
} from '-/reducers/app';
import EntryIcon from '-/components/EntryIcon';
import AppConfig from '-/config';
import { TS } from '-/tagspaces.namespace';

interface Props {
  className: string;
  style: Object;
  theme: any;
  // gridRef: Object;
  directories: Array<TS.FileSystemEntry>;
  showDirectories: boolean;
  files: Array<TS.FileSystemEntry>;
  renderCell: (entry: TS.FileSystemEntry, isLast?: boolean) => void;
  currentDirectoryColor: string;
  isAppLoading: boolean;
  currentPage: number;
  gridPageLimit: number;
  currentLocationPath: string;
  currentDirectoryPath: string;
  searchResultCount: number;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const GridPagination = (props: Props) => {
  const {
    className,
    style,
    theme,
    directories,
    showDirectories,
    renderCell,
    isAppLoading,
    currentDirectoryColor,
    gridPageLimit,
    currentPage
  } = props;
  let { files } = props;
  const allFilesCount = files.length;
  const containerEl = useRef(null);
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(props.currentPage);
    }
    if (containerEl && containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  }, [
    props.currentLocationPath,
    props.currentDirectoryPath,
    props.searchResultCount
  ]);

  const handleChange = (event, value) => {
    setPage(value);
    if (containerEl && containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  };

  let paginationCount = 10;

  let showPagination = false;
  if (gridPageLimit && files.length > gridPageLimit) {
    paginationCount = Math.ceil(files.length / gridPageLimit);
    const start = (page - 1) * gridPageLimit;
    files = files.slice(start, start + gridPageLimit);
    showPagination = true;
  }

  return (
    <div
      ref={containerEl}
      onContextMenu={(event: React.MouseEvent<HTMLDivElement>) =>
        props.onContextMenu(event)
      }
      onClick={(event: React.MouseEvent<HTMLDivElement>) =>
        props.onClick(event)
      }
      style={{
        height: '100%',
        // @ts-ignore
        overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
        backgroundColor: currentDirectoryColor || 'transparent'
      }}
    >
      <div
        className={className}
        style={style}
        data-tid="perspectiveGridFileTable"
      >
        {page === 1 && directories.map(entry => renderCell(entry))}
        {files.map((entry, index, dArray) =>
          renderCell(entry, index === dArray.length - 1)
        )}
        {isAppLoading && (
          <Typography
            style={{ padding: 15, color: theme.palette.text.primary }}
          >
            {i18n.t('core:loading')}
          </Typography>
        )}
        {!isAppLoading && files.length < 1 && directories.length < 1 && (
          <div style={{ textAlign: 'center' }}>
            <EntryIcon isFile={false} />
            <Typography
              style={{ padding: 15, color: theme.palette.text.secondary }}
            >
              {i18n.t('core:noFileFolderFound')}
            </Typography>
            <Typography style={{ color: theme.palette.text.secondary }}>
              {i18n.t('core:dragAndDropToImport')}
            </Typography>
          </div>
        )}
        {!isAppLoading &&
          files.length < 1 &&
          directories.length >= 1 &&
          !showDirectories && (
            <div style={{ textAlign: 'center' }}>
              <EntryIcon isFile={false} />
              <Typography
                style={{ padding: 15, color: theme.palette.text.secondary }}
              >
                {i18n.t('core:noFileButFoldersFound')}
              </Typography>
              <Typography style={{ color: theme.palette.text.secondary }}>
                {i18n.t('core:dragAndDropToImport')}
              </Typography>
            </div>
          )}
      </div>
      {showPagination && (
        <Tooltip
          title={
            directories.length +
            ' folder(s) and ' +
            allFilesCount +
            ' file(s) found'
          }
        >
          <Pagination
            style={{
              left: 15,
              bottom: 65,
              zIndex: 1100,
              position: 'absolute',
              backgroundColor: theme.palette.background.default,
              opacity: 0.97,
              border: '1px solid lightgray',
              borderRadius: 5,
              padding: 3
            }}
            count={paginationCount}
            page={page}
            onChange={handleChange}
          />
        </Tooltip>
      )}
      {!showPagination && (directories.length > 0 || files.length > 0) && (
        <div style={{ padding: 15, bottom: 10 }}>
          <Typography
            style={{
              fontSize: '0.9rem',
              color: theme.palette.text.secondary
            }}
          >
            {directories.length +
              ' folder(s) and ' +
              allFilesCount +
              ' file(s) found'}
          </Typography>
        </div>
      )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    isAppLoading: isLoading(state),
    currentDirectoryColor: getCurrentDirectoryColor(state),
    searchResultCount: getSearchResultCount(state)
  };
}

export default connect(mapStateToProps)(GridPagination);
