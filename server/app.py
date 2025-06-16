from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from torchvision import transforms
from PIL import Image
import io
import base64
import re
import zipfile

model = torch.jit.load('torch_ensemble.pt')


# Load TorchScript model
# with zipfile.ZipFile('torch_ensemble.pt.zip') as z:
    #with z.open('torch_ensemble.pt') as f:
        #buffer = io.BytesIO(f.read())
        #model = torch.jit.load(buffer)

model.eval()

# FastAPI app
app = FastAPI()

port=8080

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Define request body
class ImageData(BaseModel):
    data_uri: str

# Helper: Decode Data URI to PIL Image
def decode_data_uri_to_image(data_uri: str) -> Image.Image:
    match = re.match(r"data:image/.+;base64,(.*)", data_uri)
    if not match:
        raise ValueError("Invalid data URI format")
    image_data = base64.b64decode(match.group(1))
    return Image.open(io.BytesIO(image_data)).convert("RGB")

# Root endpoint
@app.get("/")
def root():
    return {"message": "Model is live!"}

# Prediction endpoint
@app.post("/predict")
async def predict_image(data: ImageData):
    try:
        img = decode_data_uri_to_image(data.data_uri)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode image: {e}")

    input_tensor = transform(img).unsqueeze(0)  # shape: (1, 3, 224, 224)

    with torch.no_grad():
        prediction = model(input_tensor).squeeze().item()

    return {"prediction": prediction}
