const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const os = require('os');

app.use(express.static(path.join(__dirname, 'public')));

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if ('IPv4' === iface.family && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}

io.on('connection', (socket) => {
    console.log('Conexión:', socket.id);
    
    // Configuración inicial (QR)
    const ip = getLocalIp();
    socket.emit('server-config', { mobileUrl: `http://${ip}:3000/mobile.html` });

    // Eventos existentes
    socket.on('nav-step', (dir) => socket.broadcast.emit('pc-step', dir));
    socket.on('pc-highlight-country', (data) => socket.broadcast.emit('mobile-show-data', data));
    socket.on('request-details', () => socket.broadcast.emit('pc-toggle-details'));
    socket.on('mobile-set-volume', (val) => socket.broadcast.emit('pc-set-volume', val));
    socket.on('mobile-toggle-overview', () => socket.broadcast.emit('pc-toggle-overview'));

    // --- NUEVO: FILTRO POR SILUETAS (Dolls) ---
    socket.on('mobile-filter-doll', (category) => {
        socket.broadcast.emit('pc-apply-filter', category);
    });
});

const port = 3000;
http.listen(port, () => {
    const ip = getLocalIp();
    console.log(`\n🚀 SISTEMA LISTO`);
    console.log(`💻 PC:      http://localhost:${port}`);
    console.log(`📱 MANDO:   http://${ip}:${port}/mobile.html`);
    console.log(`------------------------------------------------\n`);
});