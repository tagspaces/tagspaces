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
import TsButton from '-/components/TsButton';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  Typography,
  ListItem,
} from '@mui/material';
import {
  CreateFileIcon,
  ExpandIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import TsIconButton from '-/components/TsIconButton';
import TsToggleButton from '-/components/TsToggleButton';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface Props {}

function SettingsTemplates(props: Props) {
  const { t } = useTranslation();
  const editedTemplate = React.useRef<TS.FileTemplate>(undefined);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  const fileTemplatesContext = Pro?.contextProviders?.FileTemplatesContext
    ? useContext<TS.FileTemplatesContextData>(
        Pro.contextProviders.FileTemplatesContext,
      )
    : undefined;
  const templates: Map<string, TS.FileTemplate> =
    fileTemplatesContext.getTemplates();
  const templatesArray = Array.from(templates.entries());

  function saveTemplate(key?: string) {
    if (fileTemplatesContext) {
      if (key && editedTemplate.current) {
        fileTemplatesContext.setTemplate(key, editedTemplate.current);
        editedTemplate.current = undefined;
        forceUpdate();
      } else {
        // new template
        const id = getUuid();
        const defaultTemplate = fileTemplatesContext.getDefaultTemplate();
        const temp = {
          id,
          name: 'new template',
          content: defaultTemplate.content,
        };
        editedTemplate.current = temp;
        fileTemplatesContext.setTemplate(id, temp);
        forceUpdate();
      }
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
          expandIcon={<ExpandIcon />}
          aria-controls={'defaultContent'}
          data-tid={'defaultTID'}
          sx={{
            '& .MuiAccordionSummary-content': { alignItems: 'center' },
          }}
          id="template-header"
        >
          <Typography>{t('core:defaultTemplate')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TsButton
            style={{
              fontSize: 13,
              textTransform: 'unset',
              fontWeight: 'normal',
              paddingTop: 0,
              paddingBottom: 0,
            }}
            onClick={() => {
              saveTemplate();
            }}
            startIcon={<CreateFileIcon />}
          >
            {t('addTemplate')}
          </TsButton>
        </AccordionDetails>
      </Accordion>
      {templatesArray &&
        templatesArray.map(([key, template]) => (
          <Accordion
            defaultExpanded={
              editedTemplate.current &&
              editedTemplate.current.id === template.id
            }
          >
            <AccordionSummary
              expandIcon={<ExpandIcon />}
              aria-controls={template.id + 'content'}
              data-tid={template.id + 'ollamaTID'}
              sx={{
                '& .MuiAccordionSummary-content': { alignItems: 'center' },
              }}
            >
              <Typography>{currentTemplate(template).name}</Typography>
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
                      data-tid={'save' + key + 'TID'}
                      onClick={() => saveTemplate(key)}
                    >
                      {t('core:save')}
                    </TsButton>
                    <TsButton
                      variant="text"
                      data-tid={'cancel' + key + 'TID'}
                      onClick={() => cancelSavingTemplate()}
                    >
                      {t('core:cancel')}
                    </TsButton>
                  </>
                )}
            </AccordionSummary>
            <AccordionDetails>
              <List
                style={{
                  overflowX: 'hidden',
                  overflowY: 'auto',
                  height: '100%',
                }}
              >
                <ListItem>
                  <TsTextField
                    fullWidth
                    disabled={!Pro}
                    label={t('name')}
                    value={currentTemplate(template).name}
                    onChange={(e) => {
                      if (fileTemplatesContext) {
                        editedTemplate.current = {
                          ...template,
                          name: e.target.value,
                        };
                        forceUpdate();
                      }
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ToggleButtonGroup
                    value={currentTemplate(template).type}
                    size="small"
                    exclusive
                  >
                    <TsToggleButton
                      value={false}
                      data-tid="templateMdTypeTID"
                      style={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                      onClick={() => {
                        if (fileTemplatesContext) {
                          editedTemplate.current = {
                            ...template,
                            type: 'md',
                          };
                          forceUpdate();
                        }
                      }}
                    >
                      <div style={{ display: 'flex', textTransform: 'unset' }}>
                        {currentTemplate(template).type === 'md' && (
                          <CheckIcon />
                        )}
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
                      onClick={() => {
                        if (fileTemplatesContext) {
                          editedTemplate.current = {
                            ...template,
                            type: 'txt',
                          };
                          forceUpdate();
                        }
                      }}
                    >
                      <div style={{ display: 'flex', textTransform: 'unset' }}>
                        {currentTemplate(template).type === 'txt' && (
                          <CheckIcon />
                        )}
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
                      onClick={() => {
                        if (fileTemplatesContext) {
                          editedTemplate.current = {
                            ...template,
                            type: 'html',
                          };
                          forceUpdate();
                        }
                      }}
                    >
                      <div style={{ display: 'flex', textTransform: 'unset' }}>
                        {currentTemplate(template).type === 'html' && (
                          <CheckIcon />
                        )}
                        HTML
                      </div>
                    </TsToggleButton>
                  </ToggleButtonGroup>
                </ListItem>
                <ListItem>
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
                          content: e.target.value,
                        };
                        forceUpdate();
                      }
                    }}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
    </div>
  );
}

export default SettingsTemplates;
