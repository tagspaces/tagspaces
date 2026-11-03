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

/**
 * Minimal React bindings for Leaflet (BSD-2-Clause).
 * Component names and props mirror the subset of
 * react-leaflet the app used, so call sites only change their import.
 *
 * Semantics kept from react-leaflet:
 * - `MapContainer` `center` / `zoom` / `bounds` are initial values only.
 * - Children render inside the map container div once the map exists, so
 *   plain DOM children (e.g. overlays positioned with `leaflet-top` classes)
 *   work as before.
 * - `Popup` content is portalled into the Leaflet popup while it is open.
 * - Refs on `MapContainer` / `Marker` expose the Leaflet instance.
 */

import AppConfig from '-/AppConfig';
import TsTooltip from '-/components/TsTooltip';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import fscreen from 'fscreen';
import L from 'leaflet';
import 'leaflet.markercluster';
import {
  createContext,
  CSSProperties,
  forwardRef,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type LayerContainer = L.Map | L.LayerGroup;

interface LeafletContextValue {
  map: L.Map;
  /** Where child layers add themselves: the map, or an enclosing group. */
  layerContainer: LayerContainer;
}

const LeafletContext = createContext<LeafletContextValue | null>(null);
/** The layer a child `Popup` binds to. */
const PopupParentContext = createContext<L.Layer | null>(null);

function useLeafletContext(): LeafletContextValue {
  const ctx = useContext(LeafletContext);
  if (!ctx) {
    throw new Error('Leaflet components must be used inside <MapContainer>');
  }
  return ctx;
}

export function useMap(): L.Map {
  return useLeafletContext().map;
}

/**
 * Subscribes to map events. Handlers are read from a ref, so passing a fresh
 * object every render does not rebind; only a change in the set of event
 * names does.
 */
export function useMapEvents(handlers: L.LeafletEventHandlerFnMap): L.Map {
  const map = useMap();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const eventNames = Object.keys(handlers).sort().join(' ');

  useEffect(() => {
    const bound: L.LeafletEventHandlerFnMap = {};
    eventNames
      .split(' ')
      .filter(Boolean)
      .forEach((name) => {
        bound[name] = (e: L.LeafletEvent) => handlersRef.current[name]?.(e);
      });
    map.on(bound);
    return () => {
      map.off(bound);
    };
  }, [map, eventNames]);

  return map;
}

function useEventHandlers(
  instance: L.Evented,
  handlers: L.LeafletEventHandlerFnMap | undefined,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const eventNames = Object.keys(handlers ?? {})
    .sort()
    .join(' ');

  useEffect(() => {
    if (!eventNames) return undefined;
    const bound: L.LeafletEventHandlerFnMap = {};
    eventNames.split(' ').forEach((name) => {
      bound[name] = (e: L.LeafletEvent) => handlersRef.current?.[name]?.(e);
    });
    instance.on(bound);
    return () => {
      instance.off(bound);
    };
  }, [instance, eventNames]);
}

/** Adds `layer` to the nearest layer container for the component lifetime. */
function useLayerLifecycle(layer: L.Layer) {
  const { layerContainer } = useLeafletContext();
  useEffect(() => {
    layerContainer.addLayer(layer);
    return () => {
      layerContainer.removeLayer(layer);
    };
  }, [layerContainer, layer]);
}

type MapContainerProps = L.MapOptions & {
  bounds?: L.LatLngBoundsExpression;
  boundsOptions?: L.FitBoundsOptions;
  children?: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
};

export const MapContainer = forwardRef<L.Map | null, MapContainerProps>(
  function MapContainer(
    { bounds, boundsOptions, children, className, id, style, ...options },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [context, setContext] = useState<LeafletContextValue | null>(null);
    // Map options are construction-time only, as in react-leaflet.
    const initial = useRef({ bounds, boundsOptions, options });

    useImperativeHandle(ref, () => context?.map ?? null, [context]);

    useLayoutEffect(() => {
      const { bounds: b, boundsOptions: bo, options: o } = initial.current;
      const map = L.map(containerRef.current, o);
      if ((o.center == null || o.zoom == null) && b != null) {
        map.fitBounds(b, bo);
      }
      setContext({ map, layerContainer: map });
      return () => {
        map.remove();
        setContext(null);
      };
    }, []);

    return (
      <div ref={containerRef} id={id} className={className} style={style}>
        {context && (
          <LeafletContext.Provider value={context}>
            {children}
          </LeafletContext.Provider>
        )}
      </div>
    );
  },
);

type TileLayerProps = L.TileLayerOptions & {
  url: string;
  /** Factory for a custom `L.TileLayer` subclass; defaults to `L.tileLayer`. */
  createLayer?: (url: string, options: L.TileLayerOptions) => L.TileLayer;
};

export function TileLayer({ url, createLayer, ...options }: TileLayerProps) {
  const { layerContainer } = useLeafletContext();
  const urlRef = useRef(url);
  urlRef.current = url;
  const optionsKey = JSON.stringify(options);
  const [layer, setLayer] = useState<L.TileLayer | null>(null);

  // Recreate on option changes (e.g. attribution) so the attribution control,
  // which listens to layeradd/layerremove, picks the change up.
  useEffect(() => {
    const opts = JSON.parse(optionsKey);
    const instance = createLayer
      ? createLayer(urlRef.current, opts)
      : L.tileLayer(urlRef.current, opts);
    layerContainer.addLayer(instance);
    setLayer(instance);
    return () => {
      layerContainer.removeLayer(instance);
    };
  }, [layerContainer, createLayer, optionsKey]);

  useEffect(() => {
    if (layer && (layer as any)._url !== url) {
      layer.setUrl(url);
    }
  }, [layer, url]);

  return null;
}

type ControlProps = { position?: L.ControlPosition };

export function AttributionControl({
  position,
  prefix,
}: ControlProps & { prefix?: string | false }) {
  const map = useMap();
  useEffect(() => {
    const control = L.control.attribution({ position, prefix }).addTo(map);
    return () => {
      control.remove();
    };
  }, [map, position, prefix]);
  return null;
}

/**
 * Mounts a Leaflet control whose content is rendered by React. Returns the
 * control's container element (portal target) — Leaflet positions it in the
 * map corner, stacked with the built-in controls.
 */
function useReactControl(position: L.ControlPosition): HTMLDivElement {
  const map = useMap();
  const [container] = useState(() => {
    const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
  });
  useEffect(() => {
    const ReactControl = L.Control.extend({ onAdd: () => container });
    const control = new ReactControl({ position }).addTo(map);
    return () => {
      control.remove();
    };
  }, [map, position, container]);
  return container;
}

const pseudoFullscreenStyle: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
  zIndex: '1200', // above app bar / drawers, below MUI menus and dialogs
};

/**
 * Fullscreen toggle for the map. Uses the Fullscreen API where available;
 * on iOS (where it leaves WKWebView with a stale inset, see
 * FullScreenContextProvider) and where unsupported, it falls back to a fixed
 * full-viewport overlay.
 */
export function FullscreenControl({ position = 'topleft' }: ControlProps) {
  const { t } = useTranslation();
  const map = useMap();
  const container = useReactControl(position);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const useNative = fscreen.fullscreenEnabled && !AppConfig.isCapacitoriOS;

  useEffect(() => {
    if (!useNative) return undefined;
    const onChange = () =>
      setIsFullscreen(fscreen.fullscreenElement === map.getContainer());
    fscreen.addEventListener('fullscreenchange', onChange);
    return () => fscreen.removeEventListener('fullscreenchange', onChange);
  }, [map, useNative]);

  useEffect(() => {
    if (useNative || !isFullscreen) return undefined;
    const el = map.getContainer();
    const previous = el.style.cssText;
    Object.assign(el.style, pseudoFullscreenStyle);
    return () => {
      el.style.cssText = previous;
    };
  }, [map, useNative, isFullscreen]);

  // Leaflet must re-measure after the container size changes.
  useEffect(() => {
    map.invalidateSize();
  }, [map, isFullscreen]);

  // Leave native fullscreen if the map unmounts while in it.
  useEffect(
    () => () => {
      if (useNative && fscreen.fullscreenElement === map.getContainer()) {
        fscreen.exitFullscreen();
      }
    },
    [map, useNative],
  );

  const toggle = (e: ReactMouseEvent) => {
    e.preventDefault();
    if (!useNative) {
      setIsFullscreen((v) => !v);
    } else if (isFullscreen) {
      fscreen.exitFullscreen();
    } else {
      fscreen.requestFullscreen(map.getContainer());
    }
  };

  // Same markup as Leaflet's zoom buttons (`.leaflet-bar a`), so Leaflet's CSS
  // gives it the identical size, border, background and hover state.
  const iconStyle = { fontSize: 18, verticalAlign: 'middle' } as const;
  return createPortal(
    <TsTooltip title={t('core:toggleFullScreen')}>
      {/* An anchor, not a button: `.leaflet-bar a` is what Leaflet styles. */}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        href="#"
        role="button"
        aria-label={t('core:toggleFullScreen')}
        data-tid="mapFullscreenTID"
        onClick={toggle}
      >
        {isFullscreen ? (
          <FullscreenExitIcon style={iconStyle} />
        ) : (
          <FullscreenIcon style={iconStyle} />
        )}
      </a>
    </TsTooltip>,
    container,
  );
}

type MarkerProps = Omit<L.MarkerOptions, 'icon'> & {
  position: L.LatLngExpression;
  icon?: L.Icon | L.DivIcon;
  eventHandlers?: L.LeafletEventHandlerFnMap;
  children?: ReactNode;
};

export const Marker = forwardRef<L.Marker | null, MarkerProps>(function Marker(
  { position, icon, draggable, eventHandlers, children, ...options },
  ref,
) {
  const [marker] = useState(() =>
    L.marker(position, {
      ...options,
      draggable,
      ...(icon ? { icon } : {}),
    }),
  );

  useImperativeHandle(ref, () => marker, [marker]);
  useLayerLifecycle(marker);
  useEventHandlers(marker, eventHandlers);

  const lat = L.latLng(position).lat;
  const lng = L.latLng(position).lng;
  useEffect(() => {
    const current = marker.getLatLng();
    if (current.lat !== lat || current.lng !== lng) {
      marker.setLatLng([lat, lng]);
    }
  }, [marker, lat, lng]);

  useEffect(() => {
    if (icon && marker.options.icon !== icon) {
      marker.setIcon(icon);
    }
  }, [marker, icon]);

  useEffect(() => {
    if (draggable === undefined || !marker.dragging) return;
    if (draggable) {
      marker.dragging.enable();
    } else {
      marker.dragging.disable();
    }
  }, [marker, draggable]);

  return children ? (
    <PopupParentContext.Provider value={marker}>
      {children}
    </PopupParentContext.Provider>
  ) : null;
});

type PopupProps = L.PopupOptions & { children?: ReactNode };

/**
 * Binds a popup to the enclosing `Marker`. Content is rendered (via a portal)
 * only while the popup is open, so hundreds of markers don't each mount their
 * popup content up front.
 */
export function Popup({ children, ...options }: PopupProps) {
  const parent = useContext(PopupParentContext);
  const [popup] = useState(() => L.popup(options));
  const [contentNode] = useState(() => document.createElement('div'));
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (!parent) return undefined;
    popup.setContent(contentNode);
    parent.bindPopup(popup);
    const onAdd = () => setOpen(true);
    const onRemove = () => setOpen(false);
    popup.on('add', onAdd);
    popup.on('remove', onRemove);
    return () => {
      popup.off('add', onAdd);
      popup.off('remove', onRemove);
      parent.unbindPopup();
    };
  }, [parent, popup, contentNode]);

  // Re-measure and re-position once React has filled the content.
  useEffect(() => {
    if (isOpen) {
      popup.update();
    }
  });

  return isOpen ? createPortal(children, contentNode) : null;
}

type MarkerClusterGroupProps = {
  children?: ReactNode;
  disableClusteringAtZoom?: number;
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  maxClusterRadius?: number;
};

/** Clustering from leaflet.markercluster (MIT). Child markers join the group. */
export function MarkerClusterGroup({
  children,
  ...options
}: MarkerClusterGroupProps) {
  const { map } = useLeafletContext();
  const [group] = useState<L.LayerGroup>(() =>
    (L as any).markerClusterGroup(options),
  );
  const [context] = useState<LeafletContextValue>(() => ({
    map,
    layerContainer: group,
  }));
  useLayerLifecycle(group);

  return (
    <LeafletContext.Provider value={context}>
      {children}
    </LeafletContext.Provider>
  );
}
