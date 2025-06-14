import { Request, Response } from "express";

const cors = require('cors');
const express = require('express');

const app = express();
const PORT = 4000;

const targetUrl = 'https://huggingface.co/spaces/kalandjl/LeanAI-gradio/'


app.use(cors()); // Allow all origins for simplicity; customize as needed

app.post('/api/predict', async (req: Request, res: Response) => {
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    console.log('Raw response:', text);  // <-- Log raw response to debug

    // Try parsing JSON only if content-type is JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = JSON.parse(text);
      res.json(data);
    } else {
      res.status(500).send('Expected JSON but got HTML or other content');
    }
  } catch (e) {
    console.error('Error proxying request:', e);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});
