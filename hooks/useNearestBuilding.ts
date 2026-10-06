import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

import { useBuildings } from '@/hooks/useCampusData';
import type { CampusLocation } from '@/types';
import { nearestBuilding } from '@/utils/geo';

type LocateState = 'idle' | 'locating' | 'ready' | 'error';

/**
 * Turns a GPS fix into the closest campus building. The campus geofence
 * service will replace the local maths later; the shape of this hook stays.
 */
export function useNearestBuilding() {
  const buildings = useBuildings();
  const [state, setState] = useState<LocateState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const locate = useCallback(async (): Promise<CampusLocation | null> => {
    setState('locating');
    setMessage(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setState('error');
        setMessage('Location permission is off. Pick a building instead.');
        return null;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nearest = nearestBuilding(
        { latitude: position.coords.latitude, longitude: position.coords.longitude },
        buildings,
      );

      if (!nearest) {
        setState('error');
        setMessage('We could not match your position to a campus block.');
        return null;
      }

      setState('ready');
      setMessage(
        nearest.metres < 400
          ? `Matched to ${nearest.building.name} · about ${Math.round(nearest.metres)} m away`
          : `Nearest campus block is ${nearest.building.name} · about ${Math.round(nearest.metres / 1000)} km away`,
      );

      return {
        id: `${nearest.building.id}-site`,
        buildingId: nearest.building.id,
        buildingName: nearest.building.name,
      };
    } catch {
      setState('error');
      setMessage('We could not read your location on this device.');
      return null;
    }
  }, [buildings]);

  const reset = useCallback(() => {
    setState('idle');
    setMessage(null);
  }, []);

  return { state, message, locate, reset, locating: state === 'locating' };
}
