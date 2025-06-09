
from fastai.vision.all import *
import torch

def load_model_safely(model_path):
    try:
        # Try the standard approach first
        model = load_learner(model_path)
        return model
    except Exception as e:
        print(f"Standard loading failed: {e}")
        
        try:
            # Force CPU loading
            model = load_learner(model_path, cpu=True)
            return model
        except Exception as e:
            print(f"CPU loading failed: {e}")
            
            try:
                # Try with explicit device mapping
                import pickle
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
                return model
            except Exception as e:
                print(f"All loading methods failed: {e}")
                return None

# Use it in your app
model = load_model_safely("model.pkl")

if model is None:
    print("Could not load model!")


pil_img = PILImage.create('0_image_1.jpg')
test_dl = model.dls.test_dl([pil_img])
preds = model.get_preds(dl=test_dl)


# Prediction function
def predict_image(img):
    if img is None:
        return "No image received."

    try:
        pil_img = PILImage.create(img)
        _, _, probs = model.predict(pil_img)
        return round(float(probs[0]), 2)
    except Exception as e:
        return f"Error: {str(e)}"

# Launch Gradio app
gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Number(label="Predicted Value"),
    title="Image Regression (FastAI)",
    description="Upload an image to get a predicted value."
).launch(share=True)