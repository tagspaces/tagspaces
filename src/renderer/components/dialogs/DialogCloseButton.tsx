/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React from 'react';
import IconButton from '@mui/material/IconButton';
import { CloseIcon } from '../CommonIcons';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
  testId?: string; // id used for user interface test automation
}

function DialogCloseButton(props: Props) {
  const { onClose, testId } = props;
  const { t } = useTranslation();
  return (
    <IconButton
      title={t('closeButtonDialog')}
      aria-label="close"
      tabIndex={-1}
      style={{
        position: 'absolute',
        right: 5,
        top: 5,
      }}
      data-tid={testId && testId}
      onClick={onClose}
      size="large"
    >
      <CloseIcon />
    </IconButton>
  );
}

export default DialogCloseButton;
