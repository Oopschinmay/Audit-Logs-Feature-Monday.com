const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const API_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ2MTM4OTk2OCwiYWFpIjoxMDE4MTQsInVpZCI6NzI4MDgxNTAsImlhZCI6IjIwMjUtMDEtMjJUMTA6NTg6MjUuMDAwWiIsInBlciI6ImF1ZGl0OmFwaSIsImFjdGlkIjoyNjIwNTA2NiwicmduIjoiYXBzZTIifQ.7sHS4ahf8khgCk0pZG2FwGzoggJg3ROcuAaWSOqPKOE"; // Your actual token
const DOMAIN = "advaiya";


const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
const path = require('path');
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));


app.get('/api/audit-logs', async (req, res) => {
  try {
    const url = `https://${DOMAIN}.monday.com/audit-api/get-logs?page=1&per_page=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`, // ✅ Corrected
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'Failed to fetch audit logs from monday.com',
        status: response.status,
        message: text,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});



// For any non-API, non-static route, serve index.html (for React Router support)
app.get(/^\/((?!api).)*$/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
