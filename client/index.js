
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Güvenlik için bu kısmı üretimde kısıtlayın
  },
});

server.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor...');
});
