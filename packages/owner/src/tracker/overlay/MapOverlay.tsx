import { useId, useEffect } from 'react';
import useMapOverlays from './useMapOverlays';
import { useAttrPref } from '../utils/preferences';
import { map } from '../map/MapView';

const MapOverlay = () => {
  const id = useId();

  const mapOverlays = useMapOverlays();
  const selectedMapOverlay = useAttrPref('selectedMapOverlay');

  const activeOverlay = mapOverlays
    .filter((overlay) => overlay.available)
    .find((overlay) => overlay.id === selectedMapOverlay) as any;

  useEffect(() => {
    if (activeOverlay) {
      map.addSource(id, activeOverlay.source);
      map.addLayer({
        id,
        type: 'raster',
        source: id,
        layout: {
          visibility: 'visible',
        },
      });
    }
    return () => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [id, activeOverlay]);

  return null;
};

export default MapOverlay;
