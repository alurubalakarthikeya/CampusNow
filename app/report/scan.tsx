import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { QrCode } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/layout/PageHeading';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui/Buttons';
import { Card, CardSection } from '@/components/ui/Card';
import { useBuildings } from '@/hooks/useCampusData';
import { useReportDraft } from '@/stores/reportDraft';
import { haptics } from '@/utils/haptics';
import { parseCampusQr, toCampusLocation } from '@/utils/qr';

/** A plate from a demo sticker, so the flow is testable without a printer. */
const DEMO_PLATE = 'CAMPUSNOW:block-b:2nd Floor:B204';

/**
 * Scan QR. CampusNow plates are stuck next to rooms and labs; scanning one
 * sets the exact location without any typing.
 */
export default function ScanScreen() {
  const router = useRouter();
  const buildings = useBuildings();
  const setLocation = useReportDraft((state) => state.setLocation);
  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState<string | null>(null);
  const handled = useRef(false);

  const accept = (payload: string) => {
    const parsed = parseCampusQr(payload);
    const location = parsed ? toCampusLocation(parsed, buildings) : null;

    if (!location) {
      haptics.warning();
      setMessage('That code is not a CampusNow location plate. Try the one next to the room.');
      return;
    }

    handled.current = true;
    haptics.success();
    setLocation(location);
    router.back();
  };

  const onScan = (result: BarcodeScanningResult) => {
    if (handled.current) return;
    accept(result.data);
  };

  if (!permission) {
    return (
      <Screen back section="Scan QR">
        <Text style={typeScale.bodyLarge}>Preparing the camera…</Text>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen back section="Scan QR">
        <PageHeading title="Camera access needed." size="display" />
        <Card style={styles.permissionCard}>
          <CardSection
            first
            title="Why we ask"
            description="CampusNow reads the QR plate next to a room to fill in the exact location. Nothing is uploaded until you submit the report."
          />
        </Card>
        <PrimaryButton label="Allow camera" onPress={requestPermission} style={styles.permissionButton} />
        <SecondaryButton
          label="Enter location manually"
          onPress={() => router.back()}
          style={styles.permissionSecondary}
        />
      </Screen>
    );
  }

  return (
    <Screen back section="Scan QR" scroll={false} edgeToEdge contentStyle={styles.content}>
      <View style={styles.viewfinder}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handled.current ? undefined : onScan}
        />
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frame}>
            <View style={styles.corner} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Card>
          <CardSection first title="Point at the room plate">
            <View style={styles.footerHead}>
              <QrCode size={16} color={colors.primary} strokeWidth={1.9} />
              <Text style={[typeScale.meta, styles.footerCopy]}>
                {message ?? 'Hold the code inside the frame. The location fills in automatically.'}
              </Text>
            </View>
            <TextButton
              label="No camera handy? Use the demo Block B plate"
              tone="primary"
              align="left"
              onPress={() => accept(DEMO_PLATE)}
              style={styles.demo}
            />
          </CardSection>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  permissionCard: {
    marginTop: 16,
  },
  permissionButton: {
    marginTop: 20,
  },
  permissionSecondary: {
    marginTop: 10,
  },
  viewfinder: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    ...corners.panel,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '68%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    ...corners.wide,
  },
  corner: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 3,
    height: 46,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingTop: 16,
  },
  footerHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  footerCopy: {
    flex: 1,
  },
  demo: {
    marginTop: 4,
    paddingHorizontal: 0,
  },
});
