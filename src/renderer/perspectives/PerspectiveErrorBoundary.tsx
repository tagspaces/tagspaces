/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import i18n from '-/services/i18n';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

type Props = {
  perspectiveId: string;
  context: 'render' | 'onboarding';
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

// Isolates failures from external (package-shipped) perspective code so a
// crashing perspective component or onboarding body cannot take down the
// host renderer. Built-in perspectives are part of the bundle and treated
// as fully trusted; this boundary is specifically for code that ships in
// node_modules/@tagspaces/extensions/* and node_modules/@tagspacespro/extensions/*.
export class PerspectiveErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `Perspective "${this.props.perspectiveId}" (${this.props.context}) failed:`,
      error,
      info,
    );
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const message =
      this.state.error?.message || 'Unknown error while rendering perspective.';
    return (
      <Box sx={{ padding: 2 }} data-tid="perspectiveErrorBoundaryTID">
        <Alert severity="error">
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {this.props.context === 'onboarding'
              ? i18n.t('core:onboardingFailedToLoad')
              : i18n.t('core:perspectiveFailedToLoad')}
          </Typography>
          <Typography variant="body2">{message}</Typography>
          <Typography variant="caption" sx={{ display: 'block', marginTop: 1 }}>
            {i18n.t('core:perspectiveLabel')} {this.props.perspectiveId}
          </Typography>
        </Alert>
      </Box>
    );
  }
}

export default PerspectiveErrorBoundary;
