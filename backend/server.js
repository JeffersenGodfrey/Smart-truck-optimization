// server.js (Node.js)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://127.0.0.1:5500', // or 'http://localhost:5500'
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // or 'http://localhost:5500'
    methods: ['GET', 'POST'],
    credentials: true
  }
});

let driverLocation = null;
let isTracking = false;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('locationUpdate', (location) => {
    console.log('Received locationUpdate:', location);
    if (isTracking) {
      driverLocation = location;
      io.emit('driverLocation', driverLocation);
    }
  });

  socket.on('startTracking', () => {
    isTracking = true;
    console.log('Driver started sharing location');
  });

  socket.on('stopTracking', () => {
    isTracking = false;
    driverLocation = null;
    console.log('Driver stopped sharing location');
    io.emit('driverStopped');
  });

  socket.on('requestLocation', () => {
    if (driverLocation) {
      socket.emit('driverLocation', driverLocation);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});