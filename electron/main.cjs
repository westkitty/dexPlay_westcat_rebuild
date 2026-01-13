const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

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
        win.loadURL('http://localhost:5173/engine.html');
    } else {
        // Production build
        win.loadFile(path.join(__dirname, '../dist/engine.html'));
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
