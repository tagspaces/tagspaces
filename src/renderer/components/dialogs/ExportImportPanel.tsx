/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { ProLabel } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import TsSwitch from '-/components/TsSwitch';
import TsTextField from '-/components/TsTextField';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import { getLocations } from '-/reducers/locations';
import { actions as SettingsActions, getSettings } from '-/reducers/settings';
import {
  TransferEnvelope,
  TransferSection,
  buildEnvelope,
  decryptEnvelope,
  downloadEnvelope,
  evaluatePasswordStrength,
  locationsHaveCredentials,
  normalizeEnvelope,
  parseEnvelope,
  readImportFile,
  validateLocations,
  validateSearches,
  validateSettings,
  validateTagGroups,
} from '-/services/export-import-utils';
import { prepareTagGroupsForExport } from '-/services/taglibrary-utils';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { EXPORT_VERSION } from '-/services/export-import-utils';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

type Mode = 'export' | 'import';

type Props = {
  mode: Mode;
  scope?: TransferSection;
  importFile?: File;
  /** Called once the action finished (export written / import applied). */
  onDone: () => void;
  /** Cancel / close without doing anything. */
  onCancel: () => void;
};

type ItemRow = { id: string; label: string };

const ALL_SECTIONS: TransferSection[] = [
  'settings',
  'tagGroups',
  'searches',
  'locations',
];

function ExportImportPanel(props: Props) {
  const { mode, scope, importFile, onDone, onCancel } = props;
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const dispatch: AppDispatch = useDispatch();

  const settings = useSelector(getSettings);
  const allLocations: TS.Location[] = useSelector(getLocations);
  const { tagGroups } = useEditedTagLibraryContext();
  const { searches, addSearches } = useSavedSearchesContext();
  const { importTagGroups } = useTaggingActionsContext();
  const { addLocations } = useCurrentLocationContext();

  const hasPro = Boolean(Pro && Pro.UI);
  const sectionIsPro = (s: TransferSection) =>
    s === 'locations' || s === 'searches';
  const sectionEnabled = (s: TransferSection) => !sectionIsPro(s) || hasPro;

  // Locations available for export (mirrors the former ExportLocationsDialog).
  const editableLocations = useMemo(
    () => allLocations.filter((l) => !l.isNotEditable),
    [allLocations],
  );

  /* --------------------------- import parsing ---------------------------- */
  const [importPhase, setImportPhase] = useState<
    'loading' | 'password' | 'preview'
  >(mode === 'import' ? 'loading' : 'preview');
  const [rawText, setRawText] = useState<string>(undefined);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [aesPassword, setAesPassword] = useState<string>('');
  const [decryptError, setDecryptError] = useState<boolean>(false);
  const [envelope, setEnvelope] = useState<TransferEnvelope>(undefined);
  // True while the (slow) password-based KDF + cipher runs.
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (mode !== 'import' || !importFile) {
      return;
    }
    readImportFile(importFile)
      .then(({ rawText: txt, isEncrypted: enc }) => {
        setRawText(txt);
        setIsEncrypted(enc);
        if (enc) {
          setImportPhase('password');
        } else {
          const obj = parseEnvelope(txt);
          const env = normalizeEnvelope(obj);
          if (!env) {
            showNotification(t('core:invalidImportFile'), 'warning', true);
            onCancel();
            return;
          }
          setEnvelope(env);
          setImportPhase('preview');
        }
        return undefined;
      })
      .catch((e) => {
        if (e && e.message === 'too-large') {
          showNotification(t('core:importFileTooLarge'), 'error', true);
        } else {
          showNotification(t('core:invalidImportFile'), 'warning', true);
        }
        onCancel();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importFile, mode]);

  const handleDecrypt = async () => {
    if (!aesPassword || busy) {
      return;
    }
    setBusy(true);
    try {
      const obj = await decryptEnvelope(rawText, aesPassword);
      const env = obj ? normalizeEnvelope(obj) : undefined;
      if (!env) {
        setDecryptError(true);
        return;
      }
      setDecryptError(false);
      setEnvelope(env);
      setImportPhase('preview');
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------- validated import data ------------------------- */
  const validated = useMemo(() => {
    if (mode !== 'import' || !envelope) {
      return {} as Record<TransferSection, any>;
    }
    return {
      settings: validateSettings(envelope.settings),
      locations: validateLocations(envelope.locations),
      tagGroups: validateTagGroups(envelope.tagGroups),
      searches: validateSearches(envelope.searches),
    } as Record<TransferSection, any>;
  }, [mode, envelope]);

  // A section present in the file but rejected by validation.
  const invalidSections: TransferSection[] = useMemo(() => {
    if (mode !== 'import' || !envelope) {
      return [];
    }
    const out: TransferSection[] = [];
    (
      ['settings', 'locations', 'tagGroups', 'searches'] as TransferSection[]
    ).forEach((s) => {
      const present =
        s === 'settings'
          ? envelope.settings !== undefined
          : Array.isArray((envelope as any)[s]);
      if (present && !validated[s]) {
        out.push(s);
      }
    });
    return out;
  }, [mode, envelope, validated]);

  /* ------------------------- per-section model --------------------------- */
  const itemsFor = (s: TransferSection): ItemRow[] => {
    if (mode === 'export') {
      if (s === 'locations') {
        return editableLocations.map((l) => ({ id: l.uuid, label: l.name }));
      }
      if (s === 'tagGroups') {
        return (tagGroups || []).map((g) => ({ id: g.uuid, label: g.title }));
      }
      if (s === 'searches') {
        return (searches || []).map((q) => ({ id: q.uuid, label: q.title }));
      }
      return [];
    }
    // import: items come from the validated envelope
    if (s === 'locations' && validated.locations) {
      return validated.locations.map((l: TS.S3Location) => ({
        id: l.uuid,
        label: l.name,
      }));
    }
    if (s === 'tagGroups' && validated.tagGroups) {
      return validated.tagGroups.map((g: TS.TagGroup) => ({
        id: g.uuid || (g as any).key,
        label: g.title,
      }));
    }
    if (s === 'searches' && validated.searches) {
      return validated.searches.map((q: TS.SearchQuery) => ({
        id: q.uuid,
        label: q.title,
      }));
    }
    return [];
  };

  // sectionOn: user wants this section. picked: selected item ids per section.
  const [sectionOn, setSectionOn] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<Record<string, Set<string>>>({});

  // Default selection: everything in `scope` (or all when no scope), all items.
  useEffect(() => {
    const on: Record<string, boolean> = {};
    const pick: Record<string, Set<string>> = {};
    ALL_SECTIONS.forEach((s) => {
      const available =
        sectionEnabled(s) &&
        (mode === 'export'
          ? s === 'settings' || itemsFor(s).length > 0
          : s === 'settings'
            ? validated.settings !== undefined
            : Boolean(validated[s]));
      on[s] = available && (scope ? s === scope : true);
      pick[s] = new Set(itemsFor(s).map((i) => i.id));
    });
    setSectionOn(on);
    setPicked(pick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scope, hasPro, envelope, editableLocations, tagGroups, searches]);

  const toggleSection = (s: TransferSection, checked: boolean) =>
    setSectionOn((prev) => ({ ...prev, [s]: checked }));

  const toggleItem = (s: TransferSection, id: string, checked: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev[s] || []);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return { ...prev, [s]: next };
    });

  const toggleSelectAll = (s: TransferSection) =>
    setPicked((prev) => {
      const all = itemsFor(s);
      const cur = prev[s] || new Set<string>();
      const next =
        cur.size === all.length
          ? new Set<string>()
          : new Set(all.map((i) => i.id));
      return { ...prev, [s]: next };
    });

  /* ----------------------------- encryption ------------------------------ */
  const selectedExportLocations = useMemo(
    () =>
      editableLocations.filter(
        (l) => sectionOn.locations && picked.locations?.has(l.uuid),
      ) as TS.S3Location[],
    [editableLocations, sectionOn, picked],
  );

  const credentialsInSelection =
    mode === 'export' &&
    sectionOn.locations &&
    locationsHaveCredentials(selectedExportLocations);

  const [encrypt, setEncrypt] = useState<boolean>(false);
  const [exportPassword, setExportPassword] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');

  // Default encryption ON whenever the selection carries credentials.
  useEffect(() => {
    if (mode === 'export') {
      setEncrypt(Boolean(credentialsInSelection));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialsInSelection, mode]);

  const passwordMismatch =
    encrypt && retypePassword.length > 0 && exportPassword !== retypePassword;

  const pwStrength = useMemo(
    () => evaluatePasswordStrength(exportPassword),
    [exportPassword],
  );
  const passwordTooWeak =
    encrypt && exportPassword.length > 0 && !pwStrength.ok;

  /* ------------------------------- export -------------------------------- */
  const collectExportSection = (s: TransferSection) => {
    if (!sectionOn[s]) {
      return undefined;
    }
    if (s === 'settings') {
      return settings;
    }
    const ids = picked[s] || new Set<string>();
    if (s === 'locations') {
      const prep = Pro?.UI?.prepareLocationForExport;
      const sel = editableLocations.filter((l) => ids.has(l.uuid));
      return prep ? sel.map((l) => prep(l)) : undefined;
    }
    if (s === 'tagGroups') {
      const sel = (tagGroups || []).filter((g) => ids.has(g.uuid));
      return prepareTagGroupsForExport(sel);
    }
    if (s === 'searches') {
      return (searches || []).filter((q) => ids.has(q.uuid));
    }
    return undefined;
  };

  const exportSelectionEmpty = ALL_SECTIONS.every((s) => {
    if (!sectionOn[s]) {
      return true;
    }
    return s === 'settings' ? false : (picked[s]?.size || 0) === 0;
  });

  const handleExport = async () => {
    if (exportSelectionEmpty || busy) {
      if (exportSelectionEmpty) {
        showNotification(t('core:nothingSelectedToExport'), 'warning', true);
      }
      return;
    }
    if (encrypt && (!exportPassword || passwordMismatch || !pwStrength.ok)) {
      return;
    }
    const env = buildEnvelope({
      settings: collectExportSection('settings'),
      locations: collectExportSection('locations'),
      tagGroups: collectExportSection('tagGroups'),
      searches: collectExportSection('searches'),
    });
    setBusy(true);
    try {
      await downloadEnvelope(env, encrypt ? exportPassword : undefined);
    } finally {
      setBusy(false);
    }
    showNotification(t('core:successfullyExported'), 'default', true);
    onDone();
  };

  /* ------------------------------- import -------------------------------- */
  const importSelectionEmpty = ALL_SECTIONS.every((s) => {
    if (!sectionOn[s] || !validated[s]) {
      return true;
    }
    return s === 'settings' ? false : (picked[s]?.size || 0) === 0;
  });

  const handleImport = () => {
    if (importSelectionEmpty) {
      showNotification(t('core:nothingSelectedToImport'), 'warning', true);
      return;
    }
    if (
      typeof envelope?.exportVersion === 'number' &&
      envelope.exportVersion > EXPORT_VERSION
    ) {
      showNotification(t('core:importVersionNewerWarning'), 'warning', true);
    }

    let appliedAny = false;

    // 1. Settings
    if (sectionOn.settings && validated.settings) {
      const v = validated.settings;
      if (v && Object.keys(v).length > 0) {
        dispatch(SettingsActions.importSettings(v));
        appliedAny = true;
      }
    }
    // 2. Tag groups
    if (sectionOn.tagGroups && Array.isArray(validated.tagGroups)) {
      const sel = validated.tagGroups.filter((g: TS.TagGroup) =>
        picked.tagGroups?.has(g.uuid || (g as any).key),
      );
      if (sel.length > 0) {
        importTagGroups(sel);
        appliedAny = true;
      }
    }
    // 3. Saved searches
    if (sectionOn.searches && Array.isArray(validated.searches)) {
      const sel = validated.searches.filter((q: TS.SearchQuery) =>
        picked.searches?.has(q.uuid),
      );
      if (sel.length > 0) {
        addSearches(sel);
        appliedAny = true;
      }
    }
    // 4. Locations
    if (sectionOn.locations && Array.isArray(validated.locations)) {
      const sel = validated.locations.filter((l: TS.S3Location) =>
        picked.locations?.has(l.uuid),
      );
      if (sel.length > 0) {
        addLocations(sel.map((l) => new CommonLocation(l)));
        appliedAny = true;
      }
    }

    if (!appliedAny) {
      showNotification(t('core:nothingSelectedToImport'), 'warning', true);
      return;
    }
    if (invalidSections.length > 0) {
      showNotification(t('core:sectionInvalidSkipped'), 'warning', true);
    }
    showNotification(t('core:successfullyImported'), 'default', true);
    onDone();
  };

  /* ------------------------------- render -------------------------------- */
  const sectionLabel: Record<TransferSection, string> = {
    settings: t('core:settings'),
    locations: t('core:sectionLocations'),
    tagGroups: t('core:tagLibrary'),
    searches: t('core:savedSearchesTitle'),
  };

  const renderSection = (s: TransferSection) => {
    const enabledHere = sectionEnabled(s);
    const isInvalid = mode === 'import' && invalidSections.includes(s);
    const presentInImport =
      mode === 'import' &&
      (s === 'settings'
        ? envelope?.settings !== undefined
        : Array.isArray((envelope as any)?.[s]));
    if (mode === 'import' && !presentInImport && !isInvalid) {
      return null; // section simply not in the file
    }
    const rows = itemsFor(s);
    const allPicked = rows.length > 0 && (picked[s]?.size || 0) === rows.length;

    return (
      <FormControl
        key={s}
        fullWidth
        sx={{ marginBottom: '4px' }}
        disabled={!enabledHere || isInvalid}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(sectionOn[s]) && !isInvalid}
              disabled={!enabledHere || isInvalid}
              onChange={(e) => toggleSection(s, e.target.checked)}
              data-tid={'sectionToggle_' + s}
            />
          }
          label={
            <span>
              {sectionLabel[s]}
              {sectionIsPro(s) && !hasPro && <ProLabel />}
            </span>
          }
        />
        {isInvalid && (
          <FormHelperText sx={{ color: 'error.main' }}>
            {t('core:sectionInvalidSkipped')}
          </FormHelperText>
        )}
        {sectionIsPro(s) && !hasPro && (
          <FormHelperText>{t('core:proFeatureSection')}</FormHelperText>
        )}
        {enabledHere && !isInvalid && sectionOn[s] && s !== 'settings' && (
          <div style={{ paddingLeft: 28 }}>
            {rows.length > 1 && (
              <TsButton
                onClick={() => toggleSelectAll(s)}
                data-tid={'selectAll_' + s}
                style={{ marginBottom: 4 }}
              >
                {allPicked ? t('core:deselectAll') : t('core:selectAll')}
              </TsButton>
            )}
            {rows.map((row) => (
              <FormControlLabel
                key={row.id}
                sx={{ display: 'flex' }}
                control={
                  <Checkbox
                    size="small"
                    checked={Boolean(picked[s]?.has(row.id))}
                    onChange={(e) => toggleItem(s, row.id, e.target.checked)}
                  />
                }
                label={row.label}
              />
            ))}
          </div>
        )}
      </FormControl>
    );
  };

  // ---- import: password phase ----
  if (mode === 'import' && importPhase !== 'preview') {
    return (
      <div>
        {importPhase === 'loading' && (
          <Typography>{t('core:loading')}</Typography>
        )}
        {importPhase === 'password' && (
          <>
            <Typography sx={{ marginBottom: '8px' }}>
              {t('core:decryptFile')}
            </Typography>
            <FormControl fullWidth error={decryptError}>
              <TsTextField
                name="aesPassword"
                autoFocus
                slotProps={{
                  input: {
                    autoCorrect: 'off',
                    autoCapitalize: 'none',
                    type: 'password',
                  },
                }}
                label={t('core:aesPassword')}
                onChange={(event: any) => setAesPassword(event.target.value)}
                data-tid="aesPasswordTID"
              />
            </FormControl>
            {decryptError && (
              <FormHelperText sx={{ color: 'error.main' }}>
                {t('core:wrongPasswordError')}
              </FormHelperText>
            )}
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: AppConfig.defaultSpaceBetweenButtons,
              }}
            >
              <TsButton onClick={onCancel}>{t('core:cancel')}</TsButton>
              <TsButton
                onClick={handleDecrypt}
                data-tid="decryptFileTID"
                variant="contained"
                disabled={!aesPassword || busy}
              >
                {t('core:decryptFile')}
              </TsButton>
            </div>
          </>
        )}
      </div>
    );
  }

  const confirmDisabled =
    mode === 'export'
      ? exportSelectionEmpty ||
        (encrypt && (!exportPassword || passwordMismatch || !pwStrength.ok))
      : importSelectionEmpty;

  return (
    <div data-tid="unifiedExportImportPanelTID">
      <Typography sx={{ marginBottom: '8px' }}>
        {mode === 'export'
          ? t('core:selectWhatToExport')
          : t('core:selectWhatToImport')}
      </Typography>

      {ALL_SECTIONS.map(renderSection)}

      {mode === 'export' && (
        <>
          <Divider sx={{ margin: '8px 0' }} />
          <FormControl fullWidth>
            <FormControlLabel
              labelPlacement="start"
              sx={{
                marginLeft: 0,
                marginRight: 0,
                justifyContent: 'space-between',
              }}
              control={
                <TsSwitch
                  checked={encrypt}
                  onClick={() => setEncrypt(!encrypt)}
                  data-tid="encryptExportTID"
                />
              }
              label={t('core:encryptExport')}
            />
          </FormControl>
          {credentialsInSelection && !encrypt && (
            <FormHelperText sx={{ color: 'error.main' }}>
              {t('core:disableEncryptionWarning')}
            </FormHelperText>
          )}
          {credentialsInSelection && encrypt && (
            <FormHelperText>{t('core:encryptionRecommended')}</FormHelperText>
          )}
          {encrypt && (
            <>
              <FormControl fullWidth sx={{ paddingTop: '10px' }}>
                <TsTextField
                  name="exportPassword"
                  autoFocus
                  slotProps={{
                    input: { autoCorrect: 'off', autoCapitalize: 'none' },
                  }}
                  label={t('core:aesPassword')}
                  type="password"
                  onChange={(event: any) =>
                    setExportPassword(event.target.value)
                  }
                  updateValue={(value: string) => setExportPassword(value)}
                  retrieveValue={() => exportPassword}
                  data-tid="exportPasswordTID"
                />
              </FormControl>
              {exportPassword.length > 0 && (
                <div
                  data-tid="passwordStrengthTID"
                  style={{ marginTop: 4, marginBottom: 4 }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={(pwStrength.score / 4) * 100}
                    color={
                      pwStrength.label === 'weak'
                        ? 'error'
                        : pwStrength.label === 'fair'
                          ? 'warning'
                          : pwStrength.label === 'good'
                            ? 'info'
                            : 'success'
                    }
                    sx={{ borderRadius: AppConfig.defaultCSSRadius }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordTooWeak ? 'error.main' : 'text.secondary',
                    }}
                  >
                    {t('core:passwordStrength')}:{' '}
                    {t('core:pwStrength_' + pwStrength.label)}
                  </Typography>
                </div>
              )}
              {passwordTooWeak && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {t('core:passwordTooWeak')}
                </FormHelperText>
              )}
              <FormControl fullWidth error={passwordMismatch}>
                <TsTextField
                  name="retypePassword"
                  slotProps={{
                    input: { autoCorrect: 'off', autoCapitalize: 'none' },
                  }}
                  label={t('core:retypePassword')}
                  type="password"
                  onChange={(event: any) =>
                    setRetypePassword(event.target.value)
                  }
                  data-tid="retypePasswordTID"
                />
              </FormControl>
              {passwordMismatch && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {t('core:retypePasswordDiffError')}
                </FormHelperText>
              )}
            </>
          )}
        </>
      )}

      <div
        style={{
          marginTop: 16,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: AppConfig.defaultSpaceBetweenButtons,
        }}
      >
        <TsButton onClick={onCancel} data-tid="cancelExportImportTID">
          {t('core:cancel')}
        </TsButton>
        <TsButton
          onClick={mode === 'export' ? handleExport : handleImport}
          data-tid="exportImportConfirmTID"
          variant="contained"
          disabled={confirmDisabled || busy}
        >
          {mode === 'export'
            ? t('core:startExportButton')
            : t('core:startImportButton')}
        </TsButton>
      </div>
    </div>
  );
}

export default ExportImportPanel;
