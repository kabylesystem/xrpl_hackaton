import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export const BLE_SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
export const BLE_CHARACTERISTIC_UUID = '12345678-1234-1234-1234-1234567890ac';

// Expo Go doesn't ship the native module for react-native-ble-plx.
// Guard the manager creation to avoid crashes and let the caller handle fallback.
const hasBleNative = Boolean(
  (NativeModules as any).BleClientManager || (NativeModules as any).BleManager
);
const manager = hasBleNative ? new BleManager() : null;

export type BlePeer = {
  id: string;
  name: string;
};

async function ensurePermissions() {
  if (Platform.OS !== 'android') return;

  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);

  const ok =
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
    granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;

  if (!ok) {
    throw new Error('Bluetooth permissions not granted');
  }
}

export async function sendPayloadOverBle(
  payload: Record<string, any>,
  onStatus?: (msg: string) => void,
  targetDeviceId?: string
): Promise<Characteristic | null> {
  if (!manager) {
    throw new Error('BLE not available in this build (use a dev client or custom build with react-native-ble-plx).');
  }

  await ensurePermissions();

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  let stopRequested = false;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      stopRequested = true;
      manager.stopDeviceScan();
      reject(new Error('Timed out scanning for a peer. Make sure another device advertises the service UUID.'));
    }, 20000);

    onStatus?.('Scanning for peers...');
    manager.startDeviceScan([BLE_SERVICE_UUID], null, async (error, device) => {
      if (stopRequested) return;
      if (error) {
        clearTimeout(timeout);
        manager.stopDeviceScan();
        reject(error);
        return;
      }

      const isTarget = targetDeviceId ? device?.id === targetDeviceId : Boolean(device);

      if (device && isTarget) {
        try {
          onStatus?.(`Connecting to ${device.name || device.id}...`);
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          const services = await connected.services();
          const targetService = services.find((s) => s.uuid.toLowerCase() === BLE_SERVICE_UUID.toLowerCase());

          if (!targetService) {
            throw new Error('Service not found on peer');
          }

          const characteristics = await connected.characteristicsForService(targetService.uuid);
          const targetChar = characteristics.find(
            (c) => c.uuid.toLowerCase() === BLE_CHARACTERISTIC_UUID.toLowerCase()
          );

          if (!targetChar) {
            throw new Error('Characteristic not found on peer');
          }

          onStatus?.('Sending payload...');
          const result = await connected.writeCharacteristicWithResponseForService(
            targetService.uuid,
            targetChar.uuid,
            encoded
          );

          clearTimeout(timeout);
          stopRequested = true;
          manager.stopDeviceScan();
          onStatus?.('Payload sent over BLE');
          resolve(result);
        } catch (err) {
          clearTimeout(timeout);
          stopRequested = true;
          manager.stopDeviceScan();
          reject(err);
        }
      }
    });
  });
}

export function scanForBlePeers(
  onDevice: (peer: BlePeer) => void,
  onStatus?: (msg: string) => void
) {
  if (!manager) {
    onStatus?.('BLE not available in this build');
    return () => {};
  }

  let seen = new Set<string>();
  onStatus?.('Scanning for devices...');
  manager.startDeviceScan([BLE_SERVICE_UUID], null, (error, device) => {
    if (error) {
      onStatus?.(error.message);
      return;
    }
    if (device && !seen.has(device.id)) {
      seen.add(device.id);
      onDevice({
        id: device.id,
        name: device.name || 'Unknown device',
      });
    }
  });

  return () => {
    manager?.stopDeviceScan();
    seen = new Set<string>();
  };
}
