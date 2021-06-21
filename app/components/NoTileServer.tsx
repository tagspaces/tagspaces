import React from 'react';
import i18n from '-/services/i18n';

const NoTileServer = () => (
  <div style={{ textAlign: 'center' }}>
    <h1>{i18n.t('core:noTileServersTitle')}</h1>
    <h3>{i18n.t('core:addTileServersSettings')}</h3>
  </div>
);

export default NoTileServer;
