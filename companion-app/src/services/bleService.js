let deviceConnection = null;
let dataHandler = null;
let statusHandler = null;

export const connect = async (deviceName, callbacks) => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: deviceName }],
      optionalServices: ['0000fee0-0000-1000-8000-00805f9b34fb']
    });

    deviceConnection = await device.gatt.connect();
    statusHandler?.(`Connected to ${deviceName}`);
    
    const service = await deviceConnection.getPrimaryService('0000fee0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('0000fee1-0000-1000-8000-00805f9b34fb');
    
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      callbacks.onData?.(value);
    });
    
    await characteristic.startNotifications();
    dataHandler = callbacks.onData;
    statusHandler = callbacks.onStatusChange;

    return deviceConnection;
  } catch (error) {
    statusHandler?.('Connection Failed');
    throw error;
  }
};

export const send = (data) => {
  if (!deviceConnection) return;
  
  deviceConnection.getPrimaryService('0000fee0-0000-1000-8000-00805f9b34fb')
    .then(service => service.getCharacteristic('0000fee1-0000-1000-8000-00805f9b34fb'))
    .then(characteristic => {
      const buffer = new TextEncoder().encode(data);
      return characteristic.writeValue(buffer);
    });
};

export const subscribe = (handler) => {
  dataHandler = handler;
};