const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadXml: (xmlPath) => ipcRenderer.invoke('load-xml', xmlPath),
  loadXslt: (xsltPath) => ipcRenderer.invoke('load-xslt', xsltPath),
  openFile: () => ipcRenderer.invoke('open-file'),
  
  onOpenFileRequest: (callback) => ipcRenderer.on('open-file-request', callback),
  onOpenXmlFromOS: (callback) => ipcRenderer.on('open-xml-from-os', (_e, filePath) => callback(filePath)),

  findInPage: (text, options) => ipcRenderer.send('find-in-page', { text, options }),
  stopFindInPage: (action = 'clearSelection') => ipcRenderer.send('stop-find-in-page', action),
  onFoundInPage: (callback) => {
    const wrapped = (_event, result) => callback(result);
    ipcRenderer.on('found-in-page', wrapped);
    return wrapped;
  },
  removeFoundInPage: (listener) => ipcRenderer.removeListener('found-in-page', listener)
});
