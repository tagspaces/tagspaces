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

import TsTextField from '-/components/TsTextField';
import {
  Dialog,
  DialogContent,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TSDialogActions from '../dialogs/components/TsDialogActions';
import TsDialogTitle from '../dialogs/components/TsDialogTitle';
import DraggablePaper from '../DraggablePaper';
import TsButton from '../TsButton';

interface PromptEditDialogProps {
  open: boolean;
  editingPromptId: string | null;
  dialogTitle: string;
  dialogContent: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}

function PromptEditDialog(props: PromptEditDialogProps) {
  const {
    open,
    editingPromptId,
    dialogTitle,
    dialogContent,
    onTitleChange,
    onContentChange,
    onSave,
    onClose,
    onDelete,
  } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      open={open}
      scroll="paper"
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <TsDialogTitle
        dialogTitle={
          editingPromptId ? t('core:editPrompt') : t('core:createPrompt')
        }
        closeButtonTestId={''}
        onClose={onClose}
      ></TsDialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
      >
        <TsTextField
          autoFocus
          label={t('core:promptTitle')}
          value={dialogTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          retrieveValue={() => dialogTitle}
          updateValue={(value) => {
            onTitleChange(value);
          }}
          fullWidth
          placeholder={t('core:promptTitlePlaceholder')}
        />
        <TsTextField
          label={t('core:promptContent')}
          value={dialogContent}
          onChange={(e) => onContentChange(e.target.value)}
          retrieveValue={() => dialogContent}
          updateValue={(value) => {
            onContentChange(value);
          }}
          fullWidth
          multiline
          minRows={6}
          maxRows={20}
          placeholder={t('core:promptContentPlaceholder')}
        />
      </DialogContent>
      <TSDialogActions>
        {editingPromptId && (
          <TsButton onClick={onDelete} sx={{ mr: 'auto' }}>
            {t('core:delete')}
          </TsButton>
        )}
        <TsButton onClick={onClose}>{t('core:cancel')}</TsButton>
        <TsButton onClick={onSave} variant="contained" color="primary">
          {t('core:save')}
        </TsButton>
      </TSDialogActions>
    </Dialog>
  );
}

export default PromptEditDialog;
