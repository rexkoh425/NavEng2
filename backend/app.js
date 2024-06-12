const express = require('express');
const myRouter = require('./routes/router');

const app = express();
app.use(express.json());
app.use(myRouter);

module.exports = app; 