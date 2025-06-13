# Use an Anaconda base image
FROM conda/anaconda3:2023.09-0 # A common Anaconda 3 image tag. This includes Python 3.10.

# Set the working directory inside the container
WORKDIR /app

# Copy the environment.yml file
COPY environment.yml .

# Create and activate the conda environment, then install dependencies
RUN conda env update -f environment.yml

# Activate the environment for subsequent commands
SHELL ["conda", "run", "-n", "base", "/bin/bash", "-c"]

# Copy your main application file
COPY app.py /app/app.py

# Create the models directory before copying contents into it
RUN mkdir -p /app/models/

# Copy your trained FastAI model directories (e.g., model_name/model.pkl, model_name/metrics.txt)
# This will copy all subfolders and their contents from your local 'models' directory
# into the '/app/models/' directory inside the container.
COPY models/ /app/models/

# Expose the port that your Gradio application will listen on
EXPOSE 7860

# Command to run the Gradio application
CMD ["conda", "run", "-n", "base", "python", "app.py"]
