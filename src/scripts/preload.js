const { contextBridge, ipcRenderer } = require('electron');

// Wi-Fi API 노출
contextBridge.exposeInMainWorld('wifiAPI', {
  scan: () => ipcRenderer.invoke('scan-wifi'),
  connect: (ssid, password) => ipcRenderer.invoke('connect-wifi', { ssid, password }),
});
