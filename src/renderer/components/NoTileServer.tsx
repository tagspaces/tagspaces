import TsButton from '-/components/TsButton';
import MapTileServerDialog from '-/components/dialogs/MapTileServerDialog';
import { TS } from '-/tagspaces.namespace';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function NoTileServer() {
  const { t } = useTranslation();
  const [tileServerDialog, setTileServerDialog] = useState<
    (TS.MapTileServer & { isDefault: boolean }) | undefined
  >(undefined);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{t('core:noTileServersTitle')}</h1>
      <h3>{t('core:addTileServersSettings')}</h3>
      <TsButton
        variant="contained"
        onClick={() =>
          setTileServerDialog({ ...({} as TS.MapTileServer), isDefault: true })
        }
      >
        {t('core:tileServerDialogAdd')}
      </TsButton>
      {tileServerDialog && (
        <MapTileServerDialog
          open={tileServerDialog !== undefined}
          onClose={() => setTileServerDialog(undefined)}
          tileServer={tileServerDialog}
          isDefault={tileServerDialog.isDefault}
        />
      )}
    </div>
  );
}

export default NoTileServer;
