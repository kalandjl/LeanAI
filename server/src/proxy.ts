import { Request, Response } from "express";

const cors = require('cors');
const express = require('express');

const app = express();
const PORT = 4000;
import { Client } from "@gradio/client";


async function run() {

	const app = await Client.connect("https://huggingfaceh4-falcon-chat.hf.space/");
	const result = await app.predict(0, [		
				"Howdy!", // string  in 'Click on any example and press Enter in the input textbox!' Dataset component
	]);

	return result?.data
}

run();

app.use(cors()); // Allow all origins for simplicity; customize as needed

app.post('/api/predict', async (req: Request, res: Response) => {
  try {

    const data = await run()

    console.log(data)

    res.send(200)
  } catch (e) {
    console.error('Error proxying request:', e);
    res.status(500).send('Proxy error');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening at http://localhost:${PORT}`);
});
