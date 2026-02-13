const express = require('express');
const categoryRouter = require('./services/category');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Mount category routes
app.use('/api', categoryRouter);

app.get('/api/status', (req, res) => {
  console.log('Server is running');
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
