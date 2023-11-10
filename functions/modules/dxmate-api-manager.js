const express = require('express');
const cors = require('cors');

// Create a new express instance.
const app = express();

// Initialize express.
app.use(cors());

module.exports = { app };