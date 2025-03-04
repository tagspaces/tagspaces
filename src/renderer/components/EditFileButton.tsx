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

import { useTranslation } from 'react-i18next';
import TsButton from '-/components/TsButton';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';

import { EditIcon } from '-/components/CommonIcons';

function EditFileButton() {
  const { t } = useTranslation();
  const { setEditMode } = useFilePropertiesContext();

  return (
    <TsButton
      tooltip={t('core:editFile')}
      onClick={() => setEditMode(true)}
      aria-label={t('core:editFile')}
      data-tid="fileContainerEditFile"
      startIcon={<EditIcon />}
    >
      {t('core:edit')}
    </TsButton>
  );
}

export default EditFileButton;
