const express = require('express');
const app = express();

// External JS Libraries
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.listen(3001, () => {
    console.log(`Server listening at http://localhost:3001`);
})