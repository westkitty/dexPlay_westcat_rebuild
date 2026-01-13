const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveGame: (slot, data) => ipcRenderer.invoke('save-game', slot, data),
    loadGame: (slot) => ipcRenderer.invoke('load-game', slot),
    hasSave: (slot) => ipcRenderer.invoke('has-save', slot),
    deleteSave: (slot) => ipcRenderer.invoke('delete-save', slot)
});
