import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import TsIconButton from '-/components/TsIconButton';
import {
  CloseIcon,
  PrevDocumentIcon,
  NextDocumentIcon,
} from '-/components/CommonIcons';
import Tooltip from '-/components/Tooltip';
import { useTranslation } from 'react-i18next';
import { getKeyBindingObject } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';

interface Props {
  isFile: boolean;
  startClosingEntry: (event) => void;
}

function EntryContainerNav(props: Props) {
  const { isFile, startClosingEntry } = props;
  const { setActions } = usePerspectiveActionsContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <div
      style={{
        zIndex: 1,
        position: 'absolute',
        right: 0,
        top: 5,
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {isFile && (
        <>
          <TsIconButton
            tooltip={t('core:openPrevFileTooltip')}
            keyBinding={keyBindings['prevDocument']}
            aria-label={t('core:openPrevFileTooltip')}
            data-tid="fileContainerPrevFile"
            onClick={() => {
              const action: TS.PerspectiveActions = {
                action: 'openPrevious',
              };
              setActions(action);
            }}
          >
            <PrevDocumentIcon />
          </TsIconButton>

          <TsIconButton
            tooltip={t('core:openNextFileTooltip')}
            keyBinding={keyBindings['nextDocument']}
            aria-label={t('core:openNextFileTooltip')}
            data-tid="fileContainerNextFile"
            onClick={() => {
              const action: TS.PerspectiveActions = { action: 'openNext' };
              setActions(action);
            }}
          >
            <NextDocumentIcon />
          </TsIconButton>
        </>
      )}
      <TsIconButton
        tooltip={t('core:closeEntry')}
        keyBinding={keyBindings['closeViewer']}
        onClick={startClosingEntry}
        aria-label={t('core:closeEntry')}
        data-tid="fileContainerCloseOpenedFile"
      >
        <CloseIcon />
      </TsIconButton>
    </div>
  );
}

export default EntryContainerNav;
