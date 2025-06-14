FROM continuumio/miniconda3

WORKDIR /app

COPY environment.yml .

# Create conda env
RUN conda env create -f environment.yml

# Make RUN commands use the new environment:
SHELL ["conda", "run", "-n", "leanai", "/bin/bash", "-c"]

# Test fastai is installed (optional debug)
RUN python -c "import fastai; print(f'fastai version: {fastai.__version__}')"

COPY . /app

EXPOSE 7860

CMD ["conda", "run", "--no-capture-output", "-n", "leanai", "python", "app.py"]
