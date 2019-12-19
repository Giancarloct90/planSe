const express = require('express');
const app = express();

app.use(require('./empleado'));

module.exports = app;