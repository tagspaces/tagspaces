import React from 'react';
import { useTheme } from '@mui/material/styles';
import i18n from '-/services/i18n';
import { IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrevDocumentIcon from '@mui/icons-material/KeyboardArrowUp';
import NextDocumentIcon from '@mui/icons-material/KeyboardArrowDown';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useDispatch } from 'react-redux';

interface Props {
  isFile: boolean;
  startClosingFile: (event) => void;
}

function EntryContainerNav(props: Props) {
  const { isFile, startClosingFile } = props;
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();

  return (
    <div
      style={{
        zIndex: 1,
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {isFile && (
        <>
          <Tooltip title={i18n.t('core:openPrevFileTooltip')}>
            <IconButton
              aria-label={i18n.t('core:openPrevFileTooltip')}
              data-tid="fileContainerPrevFile"
              onClick={() => dispatch(AppActions.openPrevFile())}
              size="large"
            >
              <PrevDocumentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:openNextFileTooltip')}>
            <IconButton
              aria-label={i18n.t('core:openNextFileTooltip')}
              data-tid="fileContainerNextFile"
              onClick={() => dispatch(AppActions.openNextFile())}
              size="large"
            >
              <NextDocumentIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Tooltip title={i18n.t('core:closeEntry')}>
        <IconButton
          onClick={startClosingFile}
          aria-label={i18n.t('core:closeEntry')}
          data-tid="fileContainerCloseOpenedFile"
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

export default EntryContainerNav;
