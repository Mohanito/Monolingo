const express = require('express');
const app = express();

// External JS Libraries
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000'
    }
});

app.use(cors());

io.on("connection", (socket) => {
    console.log('Socket.io: New user connection');
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket.io: A user joined room ${roomId}`);
        socket.to(roomId).emit('user-connected');   // broadcast
    })
});

server.listen(3001, () => {
    console.log(`Server listening at http://localhost:3001`);
})