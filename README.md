# LeanAI
LeanAI is a machine learning powered web app which aids anyone in achieving their fitness goals. Given a few physique photos and basic metrics (weight, height) LeanAI will predict bf% and give a comprehensive diet plan to achieve desired physique goals. 

### Hugging Faces Repository:
https://huggingface.co/spaces/kalandjl/leanai-gradio/tree/main

### Model Architecture
The core LeanAI model is a pytorch ensemble of 11 different image regression models: 

    - resnet50
    - efficientnet_b3
    - densenet121
    - resnet34
    - mobilenetv3_large_100 
    - efficientnet_b0
    - resnet50d                 
    - densenet121              
    - regnety_040               
    - ghostnet_100                
    - maxvit_tiny_rw_224            
    - efficientformerv2_s0

All of these models were trained on public body fat estimation data and varying augmentation datablocks. Fastai's python library was used to streamline this process. See more in the /core folder.

### Front end
Simple Next.JS frontend which access hugging faces repo api. Use bellow commands to run:
```
https://github.com/kalandjl/LeanAI
cd client
```
```
npm run dev
```

### Notebooks
To access my notebooks which I used to train the models, run:
* Most notebooks will not work without ensemble.pt file, individual model.pkl files, or /images folder & coresponded .csv files

```
jupyter notebook
```
and navigate to the cloned git repo /core folder.

# FastAPI server
Server may not run if python --version is greater than 3.10
* Server will not work without ensemble.pt file: either download your own or use my notebooks to produce one.
```
cd /server
python app.py
```
