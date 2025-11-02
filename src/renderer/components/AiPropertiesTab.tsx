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
import AiGenDescButton from '-/components/chat/AiGenDescButton';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import ChatView from '-/components/chat/ChatView';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { isDevMode } from '-/reducers/settings';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';

interface Props {}

function AiPropertiesTab(props: Props) {
  const { openedEntry } = useOpenedEntryContext();
  const devMode: boolean = useSelector(isDevMode);

  if (!devMode || !openedEntry.isFile) {
    return <ChatView />;
  }

  return (
    <Box position="relative" display="inline-flex">
      <AiGenDescButton />
      {openedEntry.meta?.description && (
        <AiGenTagsButton
          fromDescription={true}
          sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
        />
      )}
    </Box>
  );
}

export default AiPropertiesTab;
