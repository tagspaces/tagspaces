/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import MenuItem from '@mui/material/MenuItem';
import TsSelect from '-/components/TsSelect';

interface Props {
  fileType?: 'md' | 'txt' | 'html' | 'url';
}

function TemplatesDropDown(props: Props) {
  const { fileType } = props;
  const { t } = useTranslation();
  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const templatesArray = fileTemplatesContext?.getTemplates();

  if (fileType === 'url' || !templatesArray) {
    return null;
  }

  const templates = fileType
    ? templatesArray.filter((t) => t.type === fileType)
    : templatesArray.filter((t) => t.type === undefined);

  if (!templates || templates.length < 2) {
    return null;
  }
  return (
    <TsSelect
      data-tid="tagDelimiterTID"
      label={t('defaultTemplate' + (fileType ?? ''))}
      fullWidth={false}
      title={t('core:tagDelimiter')}
      value={fileTemplatesContext?.getTemplate(fileType)?.id}
      onChange={(event) =>
        fileTemplatesContext?.setTemplateActive(event.target.value)
      }
    >
      {templates.map((tp) => (
        <MenuItem value={tp.id}>{tp.name}</MenuItem>
      ))}
    </TsSelect>
  );
}

export default TemplatesDropDown;
