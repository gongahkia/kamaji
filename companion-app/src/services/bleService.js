let bluetoothDevice = null;
let gattServer = null;
let rxCharacteristic = null; // Receive notifications from watch
let txCharacteristic = null; // Send data to watch
let dataHandler = null;
let statusHandler = null;

const SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
const CHAR_UUID = '0000fee1-0000-1000-8000-00805f9b34fb';

export const connect = async (deviceNameOrOptions = 'Kamaji', callbacks = {}) => {
  statusHandler = callbacks.onStatusChange || null;
  dataHandler = callbacks.onData || null;

  try {
    if (!navigator.bluetooth) {
      statusHandler?.('Web Bluetooth not supported');
      throw new Error('Web Bluetooth API not supported by this browser');
    }

    const filters = Array.isArray(deviceNameOrOptions)
      ? deviceNameOrOptions
      : [{ namePrefix: String(deviceNameOrOptions) }];

    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters,
      optionalServices: [SERVICE_UUID]
    });

    bluetoothDevice.addEventListener('gattserverdisconnected', () => {
      statusHandler?.('Disconnected');
    });

    gattServer = await bluetoothDevice.gatt.connect();
    statusHandler?.('Connected');

    const service = await gattServer.getPrimaryService(SERVICE_UUID);
    // For simplicity, use same characteristic UUID for RX/TX unless protocol differs
    rxCharacteristic = await service.getCharacteristic(CHAR_UUID);
    txCharacteristic = rxCharacteristic;

    rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      try {
        const value = new TextDecoder().decode(event.target.value);
        dataHandler?.(value);
      } catch (e) {
        console.error('BLE decode error', e);
      }
    });
    await rxCharacteristic.startNotifications();

    return gattServer;
  } catch (error) {
    console.error('BLE Connection Error:', error);
    statusHandler?.('Connection Failed');
    throw error;
  }
};

export const send = async (data) => {
  try {
    if (!gattServer || !txCharacteristic) return false;
    const buffer = new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data));
    await txCharacteristic.writeValue(buffer);
    return true;
  } catch (e) {
    console.error('BLE send error', e);
    return false;
  }
};

export const subscribe = (handler) => {
  dataHandler = handler;
};

export const disconnect = () => {
  try {
    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
    }
  } catch (e) {
    console.warn('BLE disconnect error', e);
  }
  bluetoothDevice = null;
  gattServer = null;
  rxCharacteristic = null;
  txCharacteristic = null;
  statusHandler?.('Disconnected');
};