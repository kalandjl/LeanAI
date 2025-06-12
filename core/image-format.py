#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
from pathlib import Path

path = Path('data/bodyfat_dataset.csv')


# In[2]:


import torch, numpy as np, pandas as pd

df = pd.read_csv(path)

df


# In[3]:


import requests
from tqdm import tqdm

def download_all_images(df, output_dir="raw_images"):
    os.makedirs(output_dir, exist_ok=True)
    image_cols = [f"image_{i}" for i in range(1, 6)]

    seen_urls = set()
    image_count = 0

    for idx, row in tqdm(df.iterrows(), total=len(df)):
        for col in image_cols:
            url = row.get(col)
            if isinstance(url, str) and url.startswith("http") and url not in seen_urls:
                try:
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        file_ext = url.split('.')[-1].split('?')[0]
                        file_name = f"{idx}_{col}.{file_ext}"
                        file_path = os.path.join(output_dir, file_name)
                        with open(file_path, "wb") as f:
                            f.write(response.content)
                        seen_urls.add(url)
                        image_count += 1
                except Exception as e:
                    print(f"Error downloading {url}: {e}")

    print(f"\nDownloaded {image_count} unique images to '{output_dir}/'")


# In[4]:


def update_mean_prediction(df, n, new_value):
    """
    Update the 'meanPrediction' value for row index n in DataFrame df.

    Args:
        df (pd.DataFrame): The dataframe to update.
        n (int): The row index to update.
        new_value (float): The new value to set.

    Returns:
        pd.DataFrame: The dataframe with the updated value.
    """
    if n in df.index:
        df.at[n, 'meanPrediction'] = new_value
    else:
        raise IndexError(f"Row index {n} not found in DataFrame.")
    return df


# In[5]:


row, pred = 652, 16

df.at[row, 'meanPrediction']


# In[6]:


df.loc[row-10:row+10]


# In[7]:


def create_regression_csv(df, output_csv="image_labels.csv", label_col="meanPrediction", image_prefix="image_", output_dir="images"):
    # Ensure column names are stripped of whitespace
    df.columns = df.columns.str.strip()

    image_cols = [col for col in df.columns if col.startswith(image_prefix)]
    records = []

    for idx, row in df.iterrows():
        label = row[label_col]
        for col in image_cols:
            url = row.get(col)
            if isinstance(url, str) and url.startswith("http"):
                ext = url.split('.')[-1].split('?')[0].lower()
                ext = ext if ext in ['jpg', 'jpeg', 'png', 'webp'] else 'jpg'
                filename = f"{idx}_{col}.{ext}"
                records.append({"filename": filename, "target": label})

    df_out = pd.DataFrame(records)
    df_out.to_csv(output_csv, index=False)
    print(f"Created {output_csv} with {len(df_out)} labeled images")
    return df_out


# In[8]:


download_all_images(df)  



# In[9]:


df_labels = create_regression_csv(df) 
df_labels.head()


# In[10]:


print(df.loc[657-5:657+2])
print(df_labels[df_labels['filename'] == "657_image_1.jpg"])


# In[11]:


from fastai.vision.all import *

failed = verify_images(get_image_files(Path('raw_images')))
failed.map(Path.unlink)
len(failed)


# In[12]:


get_ipython().system('python3.10 -m pip install -Uqq mediapipe')


# In[13]:


import mediapipe as mp
from PIL import Image
import cv2


# Paths to your datasets and images
data_dir = Path('./data')
image_labels_csv = data_dir / 'image_labels.csv'
bodyfat_csv = data_dir / 'bodyfat_dataset.csv'
images_dir = Path('raw_images')  # Adjust this path if your images are elsewhere

# Load CSVs
df_labels = pd.read_csv(image_labels_csv)
df_bodyfat = pd.read_csv(bodyfat_csv)

print(f"Labels df shape: {df_labels.shape}")
print(f"Bodyfat df shape: {df_bodyfat.shape}")

# Setup mediapipe pose detector
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)


# In[21]:


def crop_upper_body(image_path):
    img = cv2.imread(str(image_path))
    if img is None:
        print(f"Failed to read image {image_path}")
        return None

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)

    if not results.pose_landmarks:
        return None

    try:
        landmarks = results.pose_landmarks.landmark

        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]

        h, w, _ = img.shape
        xs = [left_shoulder.x * w, right_shoulder.x * w, left_hip.x * w, right_hip.x * w]
        ys = [left_shoulder.y * h, right_shoulder.y * h, left_hip.y * h, right_hip.y * h]

        xmin, xmax = int(min(xs)), int(max(xs))
        ymin, ymax = int(min(ys)), int(max(ys))

        # Add padding around landmarks
        pad_x = 20
        pad_y = 20
        xmin = max(xmin - pad_x, 0)
        xmax = min(xmax + pad_x, w)
        ymin = max(ymin - pad_y, 0)
        ymax = min(ymax + pad_y, h)

        # Final adjustment: widen the crop a little more (e.g., 10% of width)
        box_width = xmax - xmin
        expand = int(box_width * 0.3)  # Expand 10% on each side
        xmin = max(xmin - expand, 0)
        xmax = min(xmax + expand, w)

        cropped = img[ymin:ymax, xmin:xmax]
        cropped_rgb = cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB)
        return Image.fromarray(cropped_rgb)

    except Exception as e:
        print(f"Error cropping {image_path}: {e}")
        return None


# In[22]:


# Create folder for cropped images if it doesn't exist
cropped_dir = Path('images')
cropped_dir.mkdir(exist_ok=True)

cropped_paths = []
failed_images = []

for idx, row in tqdm(df_labels.iterrows(), total=len(df_labels)):
    filename = row['filename']
    img_path = images_dir / filename
    cropped_img = crop_upper_body(img_path)

    save_path = cropped_dir / filename

    if cropped_img is None:
        try:
            original_img = Image.open(img_path)
            original_img.save(save_path)
        except Exception as e:
            print(f"{e}")

    else:
        cropped_img.save(save_path)

    cropped_paths.append(str(save_path))

print(f"Done! Cropped {len([p for p in cropped_paths if p])} images, failed on {len(failed_images)} images.")

# Add cropped image paths to dataframe and save
df_labels['cropped_path'] = cropped_paths
df_labels.to_csv(data_dir / 'image_labels.csv', index=False)


# In[ ]:





# In[ ]:




