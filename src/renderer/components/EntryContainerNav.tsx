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
          <Tooltip
            title={t('core:openPrevFileTooltip')}
            keyBinding={keyBindings['prevDocument']}
          >
            <TsIconButton
              aria-label={t('core:openPrevFileTooltip')}
              data-tid="fileContainerPrevFile"
              onClick={() => {
                const action: TS.PerspectiveActions = {
                  action: 'openPrevious',
                };
                setActions(action);
                //window.dispatchEvent(new Event('previous-file'));
              }}
            >
              <PrevDocumentIcon />
            </TsIconButton>
          </Tooltip>
          <Tooltip
            title={t('core:openNextFileTooltip')}
            keyBinding={keyBindings['nextDocument']}
          >
            <TsIconButton
              aria-label={t('core:openNextFileTooltip')}
              data-tid="fileContainerNextFile"
              onClick={() => {
                const action: TS.PerspectiveActions = { action: 'openNext' };
                setActions(action);
                //window.dispatchEvent(new Event('next-file'));
              }}
            >
              <NextDocumentIcon />
            </TsIconButton>
          </Tooltip>
        </>
      )}
      <Tooltip
        title={t('core:closeEntry')}
        keyBinding={keyBindings['closeViewer']}
      >
        <TsIconButton
          onClick={startClosingEntry}
          aria-label={t('core:closeEntry')}
          data-tid="fileContainerCloseOpenedFile"
        >
          <CloseIcon />
        </TsIconButton>
      </Tooltip>
    </div>
  );
}

export default EntryContainerNav;
