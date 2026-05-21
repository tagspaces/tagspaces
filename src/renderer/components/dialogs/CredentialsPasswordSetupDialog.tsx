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
 * Modal that asks the user to create a password for at-rest credential
 * encryption (web; or Electron fallback when keychain is unavailable).
 * Mirrors the password fields + strength meter already used in
 * ExportImportPanel — reuses `evaluatePasswordStrength`.
 *
 * The dialog only collects the password and hands it to the parent, which
 * runs the actual enable flow (KDF, KDF-meta storage, key-source toggle,
 * flush + scrub).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { evaluatePasswordStrength } from '-/services/export-import-validators';

export type CredentialsPasswordSetupDialogProps = {
  open: boolean;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
};

const STRENGTH_COLOR: Record<
  'weak' | 'fair' | 'good' | 'strong',
  'error' | 'warning' | 'info' | 'success'
> = {
  weak: 'error',
  fair: 'warning',
  good: 'info',
  strong: 'success',
};

export default function CredentialsPasswordSetupDialog({
  open,
  busy,
  onCancel,
  onSubmit,
}: CredentialsPasswordSetupDialogProps) {
  const { t } = useTranslation();
  const smallScreen = useMediaQuery('(max-width: 700px)');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const strength = useMemo(
    () => evaluatePasswordStrength(password),
    [password],
  );
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = !busy && password.length > 0 && !mismatch && strength.ok;

  const reset = () => {
    setPassword('');
    setConfirm('');
  };

  // Clear local state every time the dialog closes (any path: submit,
  // cancel, parent dismiss). Otherwise reopening would still show the
  // previous password text.
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const submit = () => {
    if (!canSubmit) {
      return;
    }
    onSubmit(password);
  };

  const cancel = () => {
    reset();
    onCancel();
  };

  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      onClose={cancel}
    >
      <TsDialogTitle
        dialogTitle={t('core:credentialsSetupTitle')}
        closeButtonTestId="closeCredentialsSetupTID"
        onClose={cancel}
      />
      <DialogContent sx={{ minWidth: smallScreen ? undefined : 420 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('core:credentialsSetupSubtitle')}
        </Typography>
        <TsTextField
          name="credentialsPassword"
          autoFocus
          label={t('core:aesPassword')}
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          data-tid="credentialsPasswordTID"
          slotProps={{
            input: { autoCorrect: 'off', autoCapitalize: 'none' },
          }}
        />
        <Box sx={{ mt: 1, mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (strength.score / 4) * 100)}
            color={STRENGTH_COLOR[strength.label]}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography
            variant="caption"
            color={strength.ok ? 'text.secondary' : 'error'}
          >
            {!strength.ok && password.length > 0
              ? t('core:credentialsPasswordTooWeak')
              : ' '}
          </Typography>
        </Box>
        <TsTextField
          name="credentialsPasswordConfirm"
          label={t('core:retypePassword')}
          type="password"
          value={confirm}
          error={mismatch}
          helperText={mismatch ? t('core:credentialsPasswordsMismatch') : ' '}
          onChange={(e: any) => setConfirm(e.target.value)}
          data-tid="credentialsPasswordConfirmTID"
          slotProps={{
            input: { autoCorrect: 'off', autoCapitalize: 'none' },
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              submit();
            }
          }}
        />
      </DialogContent>
      <TsDialogActions>
        <TsButton data-tid="cancelCredentialsSetupTID" onClick={cancel}>
          {t('core:cancel')}
        </TsButton>
        <TsButton
          variant="contained"
          data-tid="submitCredentialsSetupTID"
          onClick={submit}
          disabled={!canSubmit}
          sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
        >
          {t('core:credentialsSetupConfirmButton')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}
