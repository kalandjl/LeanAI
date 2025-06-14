# /opt/anaconda3/bin/python3.10
from fastai.vision.all import *

model_paths = [
    'resnet50',
    'efficientnet_b3',
    'densenet121',
    'resnet34',
    'mobilenetv3_large_100',
    'mobilenetv3_large_100_v2',
    'mobilenetv3_large_100_v3',
    'efficientnet_b0',
    'resnet50d',                     
    'mobilenetv3_large_100',         
    'densenet121',                 
    'regnety_040',                 
    'ghostnet_100',                
    'maxvit_tiny_rw_224',            
    'efficientformerv2_s0',          
]

learners = {}

for model_path in model_paths:

    print(f"Loading model {model_path}")

    full_path = f"model/{model_path}/model.pkl"
    learn = load_learner(full_path)
    learners[model_path] = learn

    print(f"Completing loading model {model_path}")


print(f"Learners loaded - length: {len(learners)}")
import json

# Load JSON from file
with open('model/ensemble_weights.json', 'r') as f:
    model_weights = json.load(f)

class LeanAIEnsembleModel:
    def __init__(self, learners: dict, model_weights: dict):
        """
        learners: dict of {model_name: Learner}
        model_weights: dict of {model_name: float}
        """
        self.learners = learners
        self.model_weights = model_weights

    def predict(self, image_path: str) -> float:
        raw_preds = self.predict_raw(image_path)  # dict: {model_name: prediction}
        
        total_weight = 0.0
        weighted_sum = 0.0

        for model_name, pred in raw_preds.items():
            weight = self.model_weights.get(model_name, 0.0)
            weighted_sum += pred * weight
            total_weight += weight

        if total_weight == 0:
            raise ValueError(f"No valid weights for prediction on '{image_path}'.")

        return weighted_sum / total_weight

    def predict_raw(self, image_path: str) -> dict:
        """
        Return a dict of raw model predictions for the input image.
        e.g., {'resnet50': 14.2, 'efficientnet_b0': 15.1, ...}
        """
        preds = {}
        img = PILImage.create(image_path)

        for model_name, learner in self.learners.items():
            try:
                _, _, output = learner.predict(img)
                preds[model_name] = float(output[0])
            except Exception as e:
                print(f"[Warning] Prediction failed for {model_name}: {e}")
                continue

        return preds

ensemble_model = LeanAIEnsembleModel(learners, model_weights)

import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Body Fat Prediction")
    
    with gr.Row():
        image_input = gr.Image(label="Upload Image")
        output = gr.Number(label="Predicted Value")
    
    predict_btn = gr.Button("Predict")
    predict_btn.click(ensemble_model.predict, inputs=image_input, outputs=output)

demo.launch(server_name="0.0.0.0", server_port=7860)
