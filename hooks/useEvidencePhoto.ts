import { useCallback, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { useReportDraft } from '@/stores/reportDraft';

/**
 * Evidence photos for a report. Uses the library or the camera and keeps
 * the single picked URI in the report draft.
 */
export function useEvidencePhoto() {
  const photoUri = useReportDraft((state) => state.photoUri);
  const setPhoto = useReportDraft((state) => state.setPhoto);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFromLibrary = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError('Photo access is off. Enable it to attach evidence.');
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      const uri = result.assets[0].uri;
      setPhoto(uri);
      return uri;
    } catch {
      setError('We could not open your photo library.');
      return null;
    } finally {
      setBusy(false);
    }
  }, [setPhoto]);

  const takePhoto = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('Camera access is off. Enable it to attach evidence.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
      if (result.canceled || !result.assets?.[0]) return null;
      const uri = result.assets[0].uri;
      setPhoto(uri);
      return uri;
    } catch {
      setError('We could not open the camera.');
      return null;
    } finally {
      setBusy(false);
    }
  }, [setPhoto]);

  return {
    photoUri,
    busy,
    error,
    pickFromLibrary,
    takePhoto,
    clear: () => setPhoto(null),
  };
}
