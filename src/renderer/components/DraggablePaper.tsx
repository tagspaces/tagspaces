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

import { useRef } from 'react';
import Paper, { PaperProps } from '@mui/material/Paper';
import Draggable from 'react-draggable';

function DraggablePaper(props: PaperProps) {
  // react-draggable falls back to ReactDOM.findDOMNode without a nodeRef;
  // findDOMNode was removed in React 19.
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      // Exclude the dialog body and any buttons living in the draggable title
      // (close, back, action slots) from initiating a drag. On touch devices
      // react-draggable calls preventDefault() on `touchstart` once a drag
      // starts, which cancels the synthesized click — so without this the
      // title-bar close button never fires `onClose`. Matching `cancel` makes
      // react-draggable bail out before that preventDefault, letting the tap
      // through.
      cancel={'[class*="MuiDialogContent-root"], button'}
    >
      <Paper {...props} ref={nodeRef} />
    </Draggable>
  );
}
export default DraggablePaper;
