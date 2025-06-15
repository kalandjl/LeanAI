# Base image with Python and PyTorch
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy server code
COPY . .

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn torchvision torch python-multipart pillow

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
