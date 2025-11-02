import {
  CloseIcon,
  NextDocumentIcon,
  PrevDocumentIcon,
} from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { getKeyBindingObject } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  isFile: boolean;
  smallScreen: boolean;
  startClosingEntry: (event) => void;
}

function EntryContainerNav(props: Props) {
  const { isFile, startClosingEntry, smallScreen } = props;
  const { setActions } = usePerspectiveActionsContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        zIndex: 1,
        position: 'absolute',
        top: 5,
        right: 5,
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
      {!smallScreen && (
        <TsIconButton
          tooltip={t('core:closeEntry')}
          keyBinding={keyBindings['closeViewer']}
          onClick={startClosingEntry}
          aria-label={t('core:closeEntry')}
          data-tid="fileContainerCloseOpenedFile"
        >
          <CloseIcon />
        </TsIconButton>
      )}
    </Box>
  );
}

export default EntryContainerNav;
