import os
from pathlib import Path

path = Path('model.pkl')


print(f"File exists: {path.exists()}")
print(f"File size: {path.stat().st_size if path.exists() else 'N/A'} bytes")
print(f"Full path: {path.absolute()}")
import zipfile

try:
    with zipfile.ZipFile(path, 'r') as zip_file:
        print("File is a valid ZIP archive")
except zipfile.BadZipFile:
    print("File is corrupted or not a valid ZIP archive")
except FileNotFoundError:
    print("File not found")

from fastai.vision.all import *
model = load_learner("model.pkl")

def preprocess_img(pre_img):
    img = Image.open('images/0_image_1.jpg').convert('RGB')
    return transform(img).unsqueeze(0)


def predict_image(img):

    if img is None:
        return "Please upload an image first"
    
    try:
        print(f"Input type: {type(img)}")

        pil_img = PILImage.create(img)

        
        bf, _, preds = model.predict(pil_img)
        
        return float(preds[0])
        
    except Exception as e:
        return print(f"error: {e}")

pred = predict_image('images/0_image_1.jpg')               
print(pred)

import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Body Fat Prediction")
    
    with gr.Row():
        image_input = gr.Image(label="Upload Image")
        output = gr.Number(label="Predicted Value")
    
    predict_btn = gr.Button("Predict")
    predict_btn.click(predict_image, inputs=image_input, outputs=output)

demo.launch(share=True)