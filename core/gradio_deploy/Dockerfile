# Use Miniconda3 base image with Python 3.10
FROM continuumio/miniconda3

# Set working directory inside container
WORKDIR /app

# Copy environment.yml (make sure python=3.10 is set correctly inside)
COPY environment.yml .

# Create the conda environment and clean cache to reduce image size
RUN conda env create -f environment.yml && conda clean -afy

# Make sure the environment is activated when running commands
SHELL ["conda", "run", "-n", "myenv", "/bin/bash", "-c"]

# Copy your application files and model directory
COPY app.py .
COPY model/ ./model/

# Expose your app port (e.g., for Gradio)
EXPOSE 7860

# Run your app inside the conda env
CMD ["python", "app.py"]
