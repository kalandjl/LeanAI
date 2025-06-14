#!/bin/bash

# Build the Docker image
docker build -t leanai-gradio . 

# Run the container and expose Gradio port
docker run -p 7860:7860 leanai-gradio