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

/**
 * Pre-store password gate. Rendered by `index.tsx` BEFORE `configureStore`
 * when `probeBootstrap()` says password mode is active and encrypted data
 * exists.
 *
 * The store doesn't exist yet, so we can't use `Ts*` wrappers (they rely
 * on `useSelector(isDesktopMode)`). Instead we read the persisted theme
 * settings synchronously and wrap the screen in the TagSpaces MUI theme
 * (`createTSTheme`), then style raw MUI primitives with the same
 * conventions (`AppConfig.defaultCSSRadius`, outlined surfaces, the
 * TagSpaces brand mark) so the visual feel matches the rest of the app.
 */

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoIcon from '-/assets/icons/icon.png';
import AppConfig from '-/AppConfig';
import { setCredentialKey, setKeySource } from '-/services/encryptAtRestState';
import { checkVerifier, deriveRawKey } from '-/services/secure-crypto';
import {
  readPersistedThemeSettings,
  resetCredentialEncryptionStorage,
  type KdfMeta,
} from '-/services/credentialsBootstrap';
import { createTSTheme } from '-/utils/Themes';

export type UnlockScreenProps = {
  kdf: KdfMeta;
  verifierBlob: string;
  onUnlocked: () => void;
  onReset: () => void;
};

function UnlockScreenInner({
  kdf,
  verifierBlob,
  onUnlocked,
  onReset,
}: UnlockScreenProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy || password.length === 0) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const rawKey = await deriveRawKey(password, kdf.saltB64, kdf.iter);
      if (!checkVerifier(rawKey, verifierBlob)) {
        setError(t('core:credentialsUnlockWrongPassword'));
        setBusy(false);
        return;
      }
      setCredentialKey(rawKey);
      setKeySource('password');
      onUnlocked();
    } catch (e) {
      setError(t('core:credentialsUnlockWrongPassword'));
      setBusy(false);
    }
  };

  const reset = () => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(t('core:credentialsUnlockResetConfirm'));
    if (!ok) {
      return;
    }
    resetCredentialEncryptionStorage();
    setCredentialKey(null);
    setKeySource('off');
    onReset();
  };

  const r = AppConfig.defaultCSSRadius || '10px';

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          maxWidth: 440,
          width: '100%',
          borderRadius: '15px',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: r,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              TagSpaces
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.1 }}
            >
              {t('core:credentialsUnlockTitle')}
            </Typography>
          </Box>
          <Box
            component="img"
            src={LogoIcon}
            alt="TagSpaces"
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'block',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('core:credentialsUnlockSubtitle')}
        </Typography>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          size="small"
          type="password"
          label={t('core:aesPassword')}
          value={password}
          error={!!error}
          helperText={error || ' '}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) {
              setError(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              submit();
            }
          }}
          disabled={busy}
          data-tid="credentialsUnlockPasswordTID"
          slotProps={{
            input: {
              autoCorrect: 'off',
              autoCapitalize: 'none',
              sx: { borderRadius: r },
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            disableElevation
            onClick={submit}
            disabled={busy || password.length === 0}
            data-tid="credentialsUnlockButtonTID"
            sx={{ borderRadius: r, textTransform: 'none' }}
          >
            {t('core:credentialsUnlockButton')}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={reset}
            disabled={busy}
            data-tid="credentialsUnlockResetTID"
            sx={{ textTransform: 'none' }}
          >
            {t('core:credentialsUnlockForgot')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function UnlockScreen({
  kdf,
  verifierBlob,
  onUnlocked,
  onReset,
}: UnlockScreenProps) {
  // Read theme settings from persist:root synchronously (we're pre-store)
  // and rebuild the same MUI theme the app will use after rehydration.
  // `useMediaQuery` is React-context-only (window.matchMedia under the
  // hood) — it works fine without a Redux store.
  const themeSettings = useMemo(() => readPersistedThemeSettings(), []);
  const systemDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => {
    const lightTheme = createTSTheme(themeSettings.currentRegularTheme, false);
    const darkTheme = createTSTheme(themeSettings.currentDarkTheme, true);
    switch (themeSettings.currentTheme) {
      case 'dark':
        return darkTheme;
      case 'system':
        return systemDarkMode ? darkTheme : lightTheme;
      case 'light':
      default:
        return lightTheme;
    }
  }, [themeSettings, systemDarkMode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <UnlockScreenInner
          kdf={kdf}
          verifierBlob={verifierBlob}
          onUnlocked={onUnlocked}
          onReset={onReset}
        />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
