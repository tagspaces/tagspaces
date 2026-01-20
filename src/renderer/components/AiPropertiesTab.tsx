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

import ChatView from '-/components/chat/ChatView';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { isDevMode } from '-/reducers/settings';
import { useSelector } from 'react-redux';

interface Props {}

function AiPropertiesTab(props: Props) {
  const { openedEntry } = useOpenedEntryContext();
  const devMode: boolean = useSelector(isDevMode);

  return <ChatView />;

  // const iframe = document.getElementsByTagName('iframe')[0];

  // function getIframeSelection() {
  //   const iframeWindow = iframe.contentWindow;
  //   const selection = iframeWindow.getSelection();
  //   const selectionText = selection.toString();
  //   if (selectionText) {
  //     return selectionText;
  //   } else {
  //     const childIframe =
  //       iframeWindow.document.getElementsByTagName('iframe')[0];
  //     const subselection = childIframe.contentWindow.getSelection();
  //     return subselection.toString();
  //   }
  // }
  // alert(getIframeSelection());

  // return (
  //   <Box position="relative" display="inline-flex">
  //     <AiGenDescButton />
  //     {openedEntry.meta?.description && (
  //       <AiGenTagsButton
  //         fromDescription={true}
  //         sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
  //       />
  //     )}
  //   </Box>
  // );
}

export default AiPropertiesTab;
