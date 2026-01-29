const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let pendingFilePath = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const localIndex = path.join(__dirname, 'build', 'index.html');
  const startUrl = isDev ? 'http://localhost:3000' : `file://${localIndex}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFilePath) {
      mainWindow.webContents.send('open-xml-from-os', pendingFilePath);
      pendingFilePath = null;
    }
  });

  mainWindow.on('closed', () => (mainWindow = null));

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[MAIN] FAILED TO LOAD', { code, desc, url });
  });
}

const argXml = process.argv.find(arg => arg.toLowerCase().endsWith('.xml'));
if (argXml) pendingFilePath = path.resolve(argXml);

app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) mainWindow.webContents.send('open-xml-from-os', filePath);
  else pendingFilePath = filePath;
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ----------------- IPC HANDLERS -----------------
const ALLOWED_EXTENSIONS = ['.xml', '.xslt'];

function validatePath(filePath, allowed = ALLOWED_EXTENSIONS) {
  if (typeof filePath !== 'string') throw new Error('Geçersiz dosya yolu');
  const resolved = path.resolve(filePath);
  const ext = path.extname(resolved).toLowerCase();
  if (!allowed.includes(ext)) throw new Error('İzin verilmeyen dosya türü');
  if (!fs.existsSync(resolved)) throw new Error('Dosya bulunamadı');
  return resolved;
}

ipcMain.handle('load-xml', async (_e, xmlPath) => {
  const safePath = validatePath(xmlPath, ['.xml']);
  return fs.readFileSync(safePath, 'utf8');
});

ipcMain.handle('load-xslt', async (_e, xsltPath) => {
  const safePath = validatePath(xsltPath, ['.xslt']);
  return fs.readFileSync(safePath, 'utf8');
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'XML Dosyaları', extensions: ['xml'] },
      { name: 'Tüm Dosyalar', extensions: ['*'] }
    ]
  });
  return result.filePaths[0] || null;
});

// ----------------- MENU -----------------
function createMenu() {
  const template = [
    {
      label: 'Dosya',
      submenu: [
        { label: 'XML Aç', accelerator: 'Ctrl+O', click: () => mainWindow?.webContents.send('open-file-request') },
        { type: 'separator' },
        { label: 'Çık', accelerator: 'Ctrl+Q', click: () => app.quit() }
      ]
    },
    { label: 'Görünüm', submenu: [{ role: 'reload' }, { role: 'forceReload' }] }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
