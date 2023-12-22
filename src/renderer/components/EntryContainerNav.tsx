import React from 'react';
import { useTheme } from '@mui/material/styles';
import { IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrevDocumentIcon from '@mui/icons-material/KeyboardArrowUp';
import NextDocumentIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

interface Props {
  isFile: boolean;
  startClosingEntry: (event) => void;
}

function EntryContainerNav(props: Props) {
  const { isFile, startClosingEntry } = props;
  const { t } = useTranslation();
  const { openNextFile, openPrevFile } = useOpenedEntryContext();
  const theme = useTheme();

  return (
    <div
      style={{
        zIndex: 1,
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {isFile && (
        <>
          <Tooltip title={t('core:openPrevFileTooltip')}>
            <IconButton
              aria-label={t('core:openPrevFileTooltip')}
              data-tid="fileContainerPrevFile"
              onClick={() => openPrevFile()}
              size="large"
            >
              <PrevDocumentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('core:openNextFileTooltip')}>
            <IconButton
              aria-label={t('core:openNextFileTooltip')}
              data-tid="fileContainerNextFile"
              onClick={() => openNextFile()}
              size="large"
            >
              <NextDocumentIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Tooltip title={t('core:closeEntry')}>
        <IconButton
          onClick={startClosingEntry}
          aria-label={t('core:closeEntry')}
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
