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
import TsTextField from '-/components/TsTextField';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';

interface Props {}

function SettingsTemplates(props: Props) {
  const { t } = useTranslation();
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const templates: Map<string, TS.FileTemplate> =
    fileTemplatesContext.getTemplates();
  const templatesArray = Array.from(templates.entries()).filter(
    ([key, template]) => !template.disabled,
  );
  return (
    <div
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        padding: 10,
      }}
    >
      {templatesArray &&
        templatesArray.map(([key, template]) => (
          <TsTextField
            fullWidth
            multiline
            rows={5}
            disabled={!Pro}
            label={key}
            value={template.template}
            onChange={(e) => {
              fileTemplatesContext.setTemplate(key, {
                template: e.target.value,
              });
              forceUpdate();
            }}
            /* slotProps={{
        input: {
          endAdornment:
            aiTemplates.current['TEXT_TAGS_PROMPT'] &&
            actionButtons('TEXT_TAGS_PROMPT'),
        },
      }}*/
          />
        ))}
    </div>
  );
}

export default SettingsTemplates;
