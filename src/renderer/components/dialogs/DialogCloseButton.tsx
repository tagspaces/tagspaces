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

import { CloseDialogIcon } from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
  testId?: string; // id used for user interface test automation
}

function DialogCloseButton(props: Props) {
  const { onClose, testId } = props;
  const { t } = useTranslation();
  return (
    <TsIconButton
      title={t('closeButtonDialog')}
      aria-label="close"
      tabIndex={-1}
      sx={{
        // float: 'right',
        position: 'absolute',
        right: '15px',
        top: '15px',
      }}
      data-tid={testId && testId}
      onClick={onClose}
    >
      <CloseDialogIcon />
    </TsIconButton>
  );
}

export default DialogCloseButton;
