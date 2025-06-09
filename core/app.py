from fastai.vision.all import *
import gradio as gr
from PIL import Image
from pathlib import Path

path = Path('model.pkl')

print(f"Full path: {path.absolute()}")
import zipfile

try:
    with zipfile.ZipFile(path, 'r') as zip_file:
        print("File is a valid ZIP archive")
        print("Contents:", zip_file.namelist())
except zipfile.BadZipFile:
    print("File is corrupted or not a valid ZIP archive")
except FileNotFoundError:
    print("File not found")
          

model = load_learner(path)

bf,_,probs = model.predict(PILImage.create('images/0_image_1.jpg'))
print(f"Bodyfat prediction: {probs[0]:.4f}")


def predict_image(img):

    if img is None:
        return "Please upload an image first"
    
    try:
        print(f"Input type: {type(img)}")
        
        # Now convert to FastAI PILImage
        pil_img = PILImage.create(img)

        print(pil_img)
        
        bf, _, probs = model.predict(pil_img)

        bf,_,probs = model.predict(PILImage.create('images/0_image_1.jpg'))

        
        return float(probs[0])
        
    except Exception as e:
        return print(f"error: {e}")

with gr.Blocks() as demo:
    gr.Markdown("# Body Fat Prediction")
    
    with gr.Row():
        image_input = gr.Image(label="Upload Image")
        output = gr.Number(label="Predicted Value")
    
    predict_btn = gr.Button("Predict")
    predict_btn.click(predict_image, inputs=image_input, outputs=output)

demo.launch(share=True)