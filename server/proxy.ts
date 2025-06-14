import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 4000;

app.use(cors()); // Allow all origins for simplicity; customize as needed
app.use(express.json({ limit: '10mb' }));

// Proxy endpoint
app.post('/api/predict', async (req, res) => {
  try {
    // Forward the request body to the Hugging Face API
    const hfResponse = await fetch('https://huggingface.co/spaces/kalandjl/LeanAI-gradio/api/predict/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header here if your HF space requires authentication
      },
      body: JSON.stringify(req.body),
    });

    // Parse response JSON and forward it back to the client
    const data = await hfResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});
