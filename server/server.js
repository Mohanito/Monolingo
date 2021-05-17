const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api', (req, res) => {
    res.send('testing api request by client');
})

app.listen(3001, () => {
    console.log(`Server listening at http://localhost:3001`)
})