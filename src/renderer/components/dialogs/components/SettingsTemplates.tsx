/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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
import {
  CreateFileIcon,
  ExpandIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import TsToggleButton from '-/components/TsToggleButton';
import TemplatesDropDown from '-/components/dialogs/components/TemplatesDropDown';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import CheckIcon from '@mui/icons-material/Check';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {}

function SettingsTemplates(props: Props) {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const editedTemplate = React.useRef<TS.FileTemplate>(undefined);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const templatesArray = fileTemplatesContext?.getTemplates();

  function saveTemplate(key?: string) {
    if (fileTemplatesContext) {
      if (key && editedTemplate.current) {
        fileTemplatesContext.setTemplate(key, editedTemplate.current);
        editedTemplate.current = undefined;
        forceUpdate();
      } else {
        // new template
        const id = getUuid();
        const def = AppConfig.defaultTemplate;
        const temp = {
          id,
          name: 'new template',
          content: def.content,
          fileNameTmpl: def.fileNameTmpl,
        };
        editedTemplate.current = temp;
        fileTemplatesContext.setTemplate(id, temp);
        forceUpdate();
      }
    } else {
      showNotification(
        'Adding new file template is Pro feature',
        'default',
        true,
      );
    }
  }
  function deleteTemplate(key: string) {
    if (fileTemplatesContext && key) {
      fileTemplatesContext.delTemplate(key);
      forceUpdate();
    }
  }
  function cancelSavingTemplate() {
    editedTemplate.current = undefined;
    forceUpdate();
  }

  function currentTemplate(template) {
    return editedTemplate.current && editedTemplate.current.id === template.id
      ? editedTemplate.current
      : template;
  }

  const defaultTemplate =
    templatesArray?.find((t) => t.type === undefined) ||
    AppConfig.defaultTemplate;

  function toggleType(template: TS.FileTemplate, type: 'html' | 'md' | 'txt') {
    if (!fileTemplatesContext) return;

    const merged: TS.FileTemplate = { ...template, ...editedTemplate.current };

    if (merged.type === type) {
      // remove the type property from the merged result
      const { type, ...withoutType } = merged;
      editedTemplate.current = withoutType;
    } else {
      // set type to 'html' otherwise
      editedTemplate.current = { ...merged, type };
    }

    forceUpdate();
  }

  return (
    <div
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        padding: 10,
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          aria-controls={'file-template-content'}
          id="file-template-header"
          data-tid={'fileTemplatesTID'}
        >
          <Typography>{t('core:templatesTab')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            variant="caption"
            style={{ display: 'block', marginTop: -20, marginBottom: 10 }}
          >
            Supported template variables are: {'{'}date{'}'}, {'{'}time{'}'} and{' '}
            {'{'}createdInApp{'}'}. The file name template supports the variable{' '}
            {'{'}timestamp{'}'}.
          </Typography>
          <TsButton
            onClick={() => {
              saveTemplate();
            }}
            style={{ marginBottom: 10 }}
            startIcon={<CreateFileIcon />}
          >
            {t('addTemplate')}
          </TsButton>
          <TemplatesDropDown />
          <TemplatesDropDown fileType="md" />
          <TemplatesDropDown fileType="txt" />
          <TemplatesDropDown fileType="html" />
        </AccordionDetails>
      </Accordion>
      {templatesArray &&
        templatesArray.map((template) => (
          <Accordion
            defaultExpanded={
              editedTemplate.current &&
              editedTemplate.current.id === template.id
            }
          >
            <AccordionSummary
              expandIcon={<ExpandIcon />}
              aria-controls={template.id + 'content'}
              data-tid={template.id + 'TemplateTID'}
              sx={{
                '& .MuiAccordionSummary-content': { alignItems: 'center' },
              }}
            >
              <Typography>
                {currentTemplate(template).name}
                {template.type ? (
                  <span
                    style={{
                      marginLeft: 5,
                      padding: 2,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      border: '1px solid gray',
                      borderRadius: '3px',
                    }}
                  >
                    {template.type}
                  </span>
                ) : (
                  ''
                )}
                {fileTemplatesContext.getTemplate(template.type)?.id ===
                template.id
                  ? ' - ' + t('defaultTemplate')
                  : ''}
              </Typography>
              <TsIconButton
                aria-label="removeTemplate"
                tooltip={t('core:remove')}
                onClick={(e) => {
                  e.stopPropagation();
                  const result = confirm(
                    'Do you want to remove "' + template.name + '"?',
                  );
                  if (result) {
                    deleteTemplate(template.id);
                  }
                }}
                data-tid="removeAIProviderTID"
              >
                <RemoveIcon />
              </TsIconButton>
              {editedTemplate.current &&
                editedTemplate.current.id === template.id && (
                  <>
                    <TsButton
                      variant="text"
                      data-tid={'save' + template.id + 'TID'}
                      onClick={() => saveTemplate(template.id)}
                    >
                      {t('core:save')}
                    </TsButton>
                    <TsButton
                      variant="text"
                      data-tid={'cancel' + template.id + 'TID'}
                      onClick={() => cancelSavingTemplate()}
                    >
                      {t('core:cancel')}
                    </TsButton>
                  </>
                )}
            </AccordionSummary>
            <AccordionDetails>
              <TsTextField
                fullWidth
                disabled={!Pro}
                label={t('name')}
                value={currentTemplate(template).name}
                onChange={(e) => {
                  if (fileTemplatesContext) {
                    editedTemplate.current = {
                      ...template,
                      ...editedTemplate.current,
                      name: e.target.value,
                    };
                    forceUpdate();
                  }
                }}
              />
              <ToggleButtonGroup
                value={currentTemplate(template).type}
                exclusive
                style={{ marginTop: 10, marginBottom: 10 }}
                title="Template type"
              >
                <TsToggleButton
                  value={false}
                  data-tid="templateMdTypeTID"
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  onClick={() => toggleType(template, 'md')}
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {currentTemplate(template).type === 'md' && <CheckIcon />}
                    &nbsp;&nbsp;MD&nbsp;&nbsp;
                  </div>
                </TsToggleButton>
                <TsToggleButton
                  value={false}
                  data-tid="templateTxtTypeTID"
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  onClick={() => toggleType(template, 'txt')}
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {currentTemplate(template).type === 'txt' && <CheckIcon />}
                    &nbsp;TXT&nbsp;
                  </div>
                </TsToggleButton>
                <TsToggleButton
                  value={false}
                  data-tid="templateTxtTypeTID"
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                  onClick={() => toggleType(template, 'html')}
                >
                  <div style={{ display: 'flex', textTransform: 'unset' }}>
                    {currentTemplate(template).type === 'html' && <CheckIcon />}
                    HTML
                  </div>
                </TsToggleButton>
              </ToggleButtonGroup>
              <TsTextField
                fullWidth
                multiline
                rows={5}
                disabled={!Pro}
                label={t('core:templateContent')}
                value={currentTemplate(template).content}
                onChange={(e) => {
                  if (fileTemplatesContext) {
                    editedTemplate.current = {
                      ...template,
                      ...editedTemplate.current,
                      content: e.target.value,
                    };
                    forceUpdate();
                  }
                }}
              />
              <TsTextField
                fullWidth
                disabled={!Pro}
                label={t('fileNameTmpl')}
                placeholder="e.g.: note[{timestamp}]"
                value={currentTemplate(template).fileNameTmpl}
                onChange={(e) => {
                  if (fileTemplatesContext) {
                    editedTemplate.current = {
                      ...template,
                      ...editedTemplate.current,
                      fileNameTmpl: e.target.value,
                    };
                    forceUpdate();
                  }
                }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
    </div>
  );
}

export default SettingsTemplates;
