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

export type ErrorBoundaryRenderFallback = (
  error: Error,
  reset: () => void,
) => React.ReactNode;

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode | ErrorBoundaryRenderFallback;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  resetKeys?: ReadonlyArray<unknown>;
  title?: string;
  label?: string;
};

type State = {
  hasError: boolean;
  error?: Error;
  info?: React.ErrorInfo;
};

function shallowDiffer(
  a: ReadonlyArray<unknown> | undefined,
  b: ReadonlyArray<unknown> | undefined,
) {
  if (a === b) return false;
  if (!a || !b) return true;
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return true;
  return false;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', this.props.label ?? '', error, info);
    this.setState({ info });
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      shallowDiffer(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const { fallback } = this.props;
    if (typeof fallback === 'function') {
      return (fallback as ErrorBoundaryRenderFallback)(
        this.state.error as Error,
        this.reset,
      );
    }
    if (fallback !== undefined) return fallback;
    return (
      <DefaultErrorFallback
        error={this.state.error}
        info={this.state.info}
        title={this.props.title}
        label={this.props.label}
      />
    );
  }
}

function DefaultErrorFallback({
  error,
  info,
  title,
  label,
}: {
  error?: Error;
  info?: React.ErrorInfo;
  title?: string;
  label?: string;
}) {
  const message = error?.message || i18n.t('core:unexpectedError');
  const heading = title || i18n.t('core:somethingWentWrong');
  const isDev = process.env.NODE_ENV !== 'production';
  return (
    <Box sx={{ padding: 2 }} data-tid="errorBoundaryTID">
      <Alert severity="error">
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {heading}
        </Typography>
        <Typography variant="body2">{message}</Typography>
        {label && (
          <Typography variant="caption" sx={{ display: 'block', marginTop: 1 }}>
            {label}
          </Typography>
        )}
        {isDev && (error?.stack || info?.componentStack) && (
          <Box component="details" sx={{ marginTop: 1 }}>
            <Box component="summary" sx={{ cursor: 'pointer' }}>
              {i18n.t('core:showErrorDetails')}
            </Box>
            <Box
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontSize: 11,
                marginTop: 1,
                maxHeight: 240,
                overflow: 'auto',
              }}
            >
              {error?.stack}
              {info?.componentStack}
            </Box>
          </Box>
        )}
      </Alert>
    </Box>
  );
}

export default ErrorBoundary;
