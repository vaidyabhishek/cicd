const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Define the backend service URL
const backendServiceUrl = 'http://backend-service:8001';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/data', async (req, res) => {
  try {
    // Make a request to the backend service
    const response = await axios.get(`${backendServiceUrl}/api/data`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error connecting to backend service');
  }
});

app.listen(port, () => {
  console.log(`Frontend app listening at http://localhost:${port}`);
});