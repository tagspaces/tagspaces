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

import React, { ReactNode, useRef } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { withStyles } from '@material-ui/core/styles/index';
import i18n from '../services/i18n';

const styles: any = (theme: any) => ({
  dropzone: {
    margin: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1dd19f40',
    zIndex: 1000,
    border: '3px dashed white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
    color: 'white'
  }
});

interface Props {
  classes?: any;
  children: ReactNode;
  accepts: Array<string>;
  onDrop: (item) => void;
}

function TargetFileBox(props: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [collectedProps, drop] = useDrop({
    accept: props.accepts,
    collect(monitor: DropTargetMonitor) {
      const isActive = monitor.isOver({ shallow: true }) && monitor.canDrop();
      return {
        handlerId: monitor.getHandlerId(),
        isActive
      };
    },
    drop(item, monitor) {
      return props.onDrop(item); // collectedProps, monitor);
    }
  });

  drop(ref);

  const { isActive } = collectedProps;
  const { classes, children } = props;
  const dragContent = isActive ? (
    <div className={classes.dropzone}>{i18n.t('core:releaseToDrop')}</div>
  ) : (
    undefined
  );
  return (
    <div ref={ref} style={{ height: '100%' }}>
      {dragContent}
      {children}
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(TargetFileBox);
