# Use a public Miniconda base image from ContinuumIO
# This is generally more reliable for public access than 'conda/anaconda3'
FROM continuumio/anaconda3:latest 
# 'latest' will get the most recent stable Python 3.x

# Set the working directory inside the container
WORKDIR /app

# Copy the environment.yml file
COPY environment.yml .

# Create and activate the conda environment, then install dependencies
# 'conda env update' reads the environment.yml and creates/updates the environment
# Using --file to explicitly specify the environment file
RUN conda env update --file environment.yml

# Activate the environment for subsequent commands
# This ensures that 'python' and 'pip' commands use the environment's binaries
# The environment created by 'conda env update' will be named as specified in environment.yml (e.g., 'base')
SHELL ["conda", "run", "-n", "base", "/bin/bash", "-c"]

# Copy your main application file
COPY app.py /app/app.py

# Create the models directory before copying contents into it
RUN mkdir -p /app/model/

# Copy your trained FastAI model directories (e.g., model_name/model.pkl, model_name/metrics.txt)
# This will copy all subfolders and their contents from your local 'models' directory
# into the '/app/models/' directory inside the container.
COPY model/ /app/model/

# Expose the port that your Gradio application will listen on
EXPOSE 7860

# Command to run the Gradio application
CMD ["conda", "run", "-n", "base", "python", "app.py"]
