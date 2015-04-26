const port = process.env.APPLICATION_PORT || '3333';
const host = process.env.HOST || '0.0.0.0';
const express = require('express');
const app = express();
const api = require('unacademic-api');

app.use(express.static('public', {}));
app.use(api);

app.listen(port, host);

console.log('Server running on %s:%d...', host, port);

module.exports = app;
