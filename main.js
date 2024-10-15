const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const wifi = require('node-wifi');

wifi.init({
  iface: null, // 자동으로 인터페이스 선택
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/scripts/preload.js'),
      contextIsolation: true, // 반드시 true여야 함
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
}

// Wi-Fi 스캔 핸들러
ipcMain.handle('scan-wifi', async () => {
  try {
    const networks = await wifi.scan();
    return networks;
  } catch (error) {
    console.error('Wi-Fi 스캔 오류:', error);
    return [];
  }
});

// Wi-Fi 연결 핸들러
ipcMain.handle('connect-wifi', async (event, { ssid, password }) => {
  try {
    await wifi.connect({ ssid, password });
    return true;
  } catch (error) {
    console.error('Wi-Fi 연결 오류:', error);
    return false;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
