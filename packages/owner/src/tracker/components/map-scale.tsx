import maplibregl from 'maplibre-gl';
import { useEffect, useMemo } from 'react';
import { map } from '../map/MapView';
import { useAttrPref } from '../utils/preferences';

const MapScale = () => {
  const distanceUnit = useAttrPref('distanceUnit');

  const control = useMemo(() => new maplibregl.ScaleControl(), []);

  useEffect(() => {
    map.addControl(control, 'bottom-left');
    return () => {map.removeControl(control);}
  }, [control]);

  useEffect(() => {
    switch (distanceUnit) {
      case 'mi':
        control.setUnit('imperial');
        break;
      case 'nmi':
        control.setUnit('nautical');
        break;
      case 'km':
      default:
        control.setUnit('metric');
        break;
    }
  }, [control, distanceUnit]);

  return null;
};

export default MapScale;
