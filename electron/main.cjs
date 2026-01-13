const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// High Res SNES Style
const WINDOW_WIDTH = 800;
const WINDOW_HEIGHT = 600;

function createWindow() {
    const win = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        useContentSize: true, // Width/Height includes content only
        resizable: false,     // Fixed aspect ratio
        title: 'West Cat Goes East',
        backgroundColor: '#000000',
        icon: path.join(__dirname, '../icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Check if we are in dev mode (packaged vs unpackaged)
    const isDev = !app.isPackaged;

    if (isDev) {
        // Vite dev server
        win.loadURL('http://localhost:5173/index.html');
        // Enable DevTools in development
        win.webContents.openDevTools();
    } else {
        // Production build
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Remove menu bar for immersive SNES feel
    Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers for Native Saves
const SAVE_DIR = path.join(app.getPath('userData'), 'saves');
if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR);

ipcMain.handle('save-game', (event, slot, data) => {
    const filePath = path.join(SAVE_DIR, `save_${slot}.sav`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
});

ipcMain.handle('load-game', (event, slot) => {
    const filePath = path.join(SAVE_DIR, `save_${slot}.sav`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
});

ipcMain.handle('has-save', (event, slot) => {
    const filePath = path.join(SAVE_DIR, `save_${slot}.sav`);
    return fs.existsSync(filePath);
});

ipcMain.handle('delete-save', (event, slot) => {
    const filePath = path.join(SAVE_DIR, `save_${slot}.sav`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
});
