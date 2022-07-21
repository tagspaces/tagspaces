import React from 'react';
import i18n from '-/services/i18n';
import { connect } from 'react-redux';
import { getCurrentLanguage } from '-/reducers/settings';

function NoTileServer() {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{i18n.t('core:noTileServersTitle')}</h1>
      <h3>{i18n.t('core:addTileServersSettings')}</h3>
    </div>
  );
}

function mapStateToProps(state) {
  return { language: getCurrentLanguage(state) };
}

export default connect(mapStateToProps)(NoTileServer);
