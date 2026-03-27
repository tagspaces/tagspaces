/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import { createTileLayerComponent, updateGridLayer } from '@react-leaflet/core';
import L from 'leaflet';
import { TileLayerProps } from 'react-leaflet';

const ElectronTileLayerClass = L.TileLayer.extend({
  createTile(coords: L.Coords, done: L.DoneCallback) {
    const img = document.createElement('img');
    img.alt = '';
    const url = this.getTileUrl(coords);
    const electronIO = (window as any).electronIO;
    if (electronIO) {
      electronIO.ipcRenderer
        .invoke('fetchTile', url)
        .then((dataUrl: string) => {
          img.onload = () => done(null, img);
          img.onerror = (e) => done(e as unknown as Error, img);
          img.src = dataUrl;
        })
        .catch((err: Error) => done(err, img));
    } else {
      img.src = url;
      img.addEventListener('load', () => done(undefined, img));
      img.addEventListener('error', (e) => done(e as unknown as Error, img));
    }
    return img;
  },
});

const ElectronTileLayer = createTileLayerComponent<L.TileLayer, TileLayerProps>(
  ({ url, ...options }, context) => ({
    instance: new (ElectronTileLayerClass as any)(url, options),
    context,
  }),
  (instance, props, prevProps) => {
    updateGridLayer(instance, props, prevProps);
    if (props.url !== prevProps.url) {
      instance.setUrl(props.url);
    }
  },
);

export default ElectronTileLayer;
