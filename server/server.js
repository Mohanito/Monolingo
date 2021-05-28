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
    socket.on('join-room', (roomId, username, peerId) => {
        socket.join(roomId);
        console.log(`Socket.io: ${username} joined room ${roomId}, peer id = ${peerId}`);
        socket.to(roomId).emit('user-connected', username, peerId);   // broadcast

        socket.on('send-message', (message) => {
            socket.to(roomId).emit('broadcast-message', username, message);
        });

        socket.on('disconnect', () => {
            console.log(`Socket.io: ${username} left room ${roomId}`);
            socket.to(roomId).emit('user-disconnected', username, peerId);
        })
    })
});

server.listen(3001, () => {
    console.log(`Server listening at http://localhost:3001`);
})