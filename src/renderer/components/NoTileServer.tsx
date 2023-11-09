import React from 'react';
import { useTranslation } from 'react-i18next';

function NoTileServer() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{t('core:noTileServersTitle')}</h1>
      <h3>{t('core:addTileServersSettings')}</h3>
    </div>
  );
}

export default NoTileServer;
