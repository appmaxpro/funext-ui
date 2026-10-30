import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { googleProtocol } from "maplibre-google-maps";
import React, {
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useTheme } from "~/ui";
import { SwitcherControl } from "../switcher/switcher";
import { mapImages } from "./preloadImages";
import useMapStyles from "./useMapStyles";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { useAttrPref, usePreference } from "../utils/preferences";
import { useLocalStorage } from "~/hooks/use-local-storage";

const element = document.createElement("div");
element.style.width = "100%";
element.style.height = "100%";
element.style.boxSizing = "initial";

maplibregl.addProtocol("google", googleProtocol);

export const map = new maplibregl.Map({
  container: element,
  attributionControl: false,
});

let ready = false;
type Listener = (ready: boolean) => void;
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
      console.log("addImage:", [key, value]);
      map.addImage(key, value as any, {
        pixelRatio: window.devicePixelRatio,
      });
    });
  }
};

const MapView = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const containerEl = useRef<HTMLElement>(null);

  const [mapReady, setMapReady] = useState(false);

  const mapStyles = useMapStyles();
  const activeMapStyles = useAttrPref(
    "activeMapStyles",
    "locationIqStreets,locationIqDark,openFreeMap",
  );
  const [defaultMapStyle, setMapStyle] = useLocalStorage(
    "selectedMapStyle",
    usePreference("map", "locationIqStreets"),
  );
  const mapboxAccessToken = useAttrPref("mapboxAccessToken");
  const maxZoom = useAttrPref("web.maxZoom");

  const switcher = useMemo(
    () =>
      new SwitcherControl(
        () => updateReadyValue(false),
        (styleId: any) => setMapStyle(styleId),
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
      ),
    [],
  );

  useAsyncEffect(async () => {
    if (theme.direction === "rtl") {
      (maplibregl as any).setRTLTextPlugin("/mapbox-gl-rtl-text.js");
    }
  }, [theme.direction]);

  useEffect(() => {
    const attribution = new maplibregl.AttributionControl({ compact: true });
    const navigation = new maplibregl.NavigationControl();
    map.addControl(
      attribution,
      theme.direction === "rtl" ? "bottom-left" : "bottom-right",
    );
    map.addControl(
      navigation,
      theme.direction === "rtl" ? "top-left" : "top-right",
    );
    map.addControl(
      switcher as any,
      theme.direction === "rtl" ? "top-left" : "top-right",
    );
    return () => {
      map.removeControl(switcher as any);
      map.removeControl(navigation);
      map.removeControl(attribution);
    };
  }, [theme.direction, switcher]);

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
      (s: any) => s.available && activeMapStyles.includes(s.id),
    );
    const styles = filteredStyles.length
      ? filteredStyles
      : mapStyles.filter((s: any) => s.id === "osm");
    switcher.updateStyles(styles, defaultMapStyle);
  }, [mapStyles, defaultMapStyle, activeMapStyles, switcher]);

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
      {React.Children.map(children, (child: any) => {
        if (
          React.isValidElement(child) &&
          (child.type as any).handlesMapReady
        ) {
          return React.cloneElement(child, { mapReady } as any);
        }
        return mapReady ? child : null;
      })}
    </div>
  );
};

export default MapView;
