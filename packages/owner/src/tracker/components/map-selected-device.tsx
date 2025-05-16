import { useEffect } from 'react';
import { map } from '../map/MapView';
import { useDeviceStore } from '../store/devices';
import { usePrevious } from '@funext/ui';
import { useAttributePreference } from '../utils/preferences';
import { useTrackerSession } from '../store/session';
import { Dimensions } from '~/utils/constant';

const MapSelectedDevice = ({ mapReady }: {mapReady: boolean}) => {
  const currentTime = useDeviceStore((state) => state.selectTime);
  const currentId = useDeviceStore((state) => state.selectedId);
  const previousTime = usePrevious(currentTime);
  const previousId = usePrevious(currentId);

  const selectZoom = useAttributePreference('web.selectZoom', 10);
  const mapFollow = useAttributePreference('mapFollow', false);

  const position = useTrackerSession((state) => state.positions[currentId as any]);

  const previousPosition = usePrevious(position);

  useEffect(() => {
    if (!mapReady) return;

    const positionChanged = position && (!previousPosition || position.latitude !== previousPosition.latitude || position.longitude !== previousPosition.longitude);

    if ((currentId !== previousId || currentTime !== previousTime || (mapFollow && positionChanged)) && position) {
      map.easeTo({
        center: [position.longitude, position.latitude],
        zoom: Math.max(map.getZoom(), selectZoom),
        offset: [0, -Dimensions.popupMapOffset / 2],
      });
    }
  }, [currentId, previousId, currentTime, previousTime, mapFollow, position, selectZoom, mapReady]);

  return null;
};

MapSelectedDevice.handlesMapReady = true;

export default MapSelectedDevice;
