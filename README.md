# LeanAI
LeanAI is a machine learning powered web app which aids anyone in achieving their fitness goals. Given a few physique photos and basic metrics (weight, height) LeanAI will predict bf% and give a comprehensive diet plan to achieve desired physique goals. 

### Hugging Faces Repository:
[https://huggingface.co/spaces/kalandjl/leanai-api/tree/main](url)

### Model Architecture
The core LeanAI model is a pytorch ensemble of 11 different image regression models: 


    - resnet50
    - efficientnet_b3
    - densenet121
    - resnet34
    - mobilenetv3_large_100 
    - efficientnet_b0
    - resnet50d                 
    - mobilenetv3_large_100    
    - densenet121              
    - regnety_040               
    - ghostnet_100                
    - maxvit_tiny_rw_224            
    - efficientformerv2_s0

All of these models were trained on public body fat estimation data and varying augmentation datablocks. Fastai's python library was used to streamline this process. See more in the /core folder.

### Front end
Simple Next.JS frontend which access hugging faces repo api. Use bellow commands to run:
```
npm run dev
```
