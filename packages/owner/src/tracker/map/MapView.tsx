// eslint-disable-next-line import/no-unresolved
import mapboxglRtlTextUrl from "@mapbox/mapbox-gl-rtl-text/mapbox-gl-rtl-text.min?url";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { googleProtocol } from "maplibre-google-maps";
import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import { SwitcherControl } from "../switcher/switcher";
import { useAttributePreference, usePreference } from "../utils/preferences";

import { mapImages } from "./preloadImages";
import useMapStyles from "./useMapStyles";
import { useLocalStorage } from "~/hooks/use-local-storage";

const element = document.createElement("div");
element.style.width = "100%";
element.style.height = "100%";
element.style.boxSizing = "initial";

(maplibregl as any).setRTLTextPlugin(mapboxglRtlTextUrl);
maplibregl.addProtocol("google", googleProtocol);

export const map = new maplibregl.Map({
  container: element,
});

type Listener = (ready: boolean) => void;
let ready = false;
const readyListeners = new Set<Listener>();

const addReadyListener = (listener: Listener) => {
  readyListeners.add(listener);
  listener(ready);
};

const removeReadyListener = (listener: Listener) => {
  readyListeners.delete(listener);
};

const updateReadyValue = (value: boolean) => {
  ready = value;
  readyListeners.forEach((listener) => listener(value));
};

const initMap = async () => {
  if (ready) return;
  if (!map.hasImage("background")) {
    Object.entries(mapImages).forEach(([key, value]) => {
      map.addImage(key, value as HTMLImageElement, {
        pixelRatio: window.devicePixelRatio,
      });
    });
  }
};

map.addControl(new maplibregl.NavigationControl());

const switcher = new SwitcherControl(
  () => updateReadyValue(false),
  (styleId: any) => useLocalStorage("selectedMapStyle", styleId),
  () => {
    map.once("styledata", () => {
      const waiting = () => {
        if (!map.loaded()) {
          setTimeout(waiting, 33);
        } else {
          initMap();
          updateReadyValue(true);
        }
      };
      waiting();
    });
  },
);

map.addControl(switcher as maplibregl.IControl);

const MapView = ({ children }: { children: React.ReactNode }) => {
  const containerEl = useRef<HTMLElement>(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttributePreference(
    "activeMapStyles",
    "locationIqStreets,locationIqDark,openFreeMap",
  );
  const [defaultMapStyle] = useLocalStorage(
    "selectedMapStyle",
    usePreference("map", "locationIqStreets"),
  );
  const mapboxAccessToken = useAttributePreference("mapboxAccessToken");
  const maxZoom = useAttributePreference("web.maxZoom");

  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom);
    }
  }, [maxZoom]);

  useEffect(() => {
    (maplibregl as any).accessToken = mapboxAccessToken;
  }, [mapboxAccessToken]);

  useEffect(() => {
    const filteredStyles = mapStyles.filter(
      (s:any) => s.available && activeMapStyles.includes(s.id),
    );
    const styles = filteredStyles.length
      ? filteredStyles
      : mapStyles.filter((s:any) => s.id === "osm");
    switcher.updateStyles(styles, defaultMapStyle);
  }, [mapStyles, defaultMapStyle]);

  useEffect(() => {
    const listener = (ready: boolean) => setMapReady(ready);
    addReadyListener(listener);
    return () => {
      removeReadyListener(listener);
    };
  }, []);

  useLayoutEffect(() => {
    const currentEl = containerEl.current;
    currentEl?.appendChild(element);
    map.resize();
    return () => {
      currentEl?.removeChild(element);
    };
  }, [containerEl]);

  return (
    <div style={{ width: "100%", height: "100%" }} ref={containerEl as any}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child as any).type.handlesMapReady) {
          return React.cloneElement(child as any, { mapReady });
        }
        return mapReady ? child : null;
      })}
    </div>
  );
};

export default MapView;
