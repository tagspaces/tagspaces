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
import { classes, DnD } from '-/components/DnD.css';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  accepts: Array<string>;
  onDrop: (item) => void;
}

function TargetFileBox(props: Props) {
  const { t } = useTranslation();
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
  const { children } = props;
  const dragContent = isActive ? (
    <div className={classes.dropzone}>{t('core:releaseToDrop')}</div>
  ) : (
    undefined
  );
  return (
    <DnD ref={ref} style={{ height: '100%' }}>
      {dragContent}
      {children}
    </DnD>
  );
}

export default TargetFileBox;
