# LeanAI: An AI-Powered Body Fat Estimation Tool
## The Inspiration
As a long-time weightlifting enthusiast, I've learned that data, not emotion, drives results. A key metric in any fitness journey is body fat percentage, which dictates whether one should focus on building muscle ("bulking") or losing fat ("cutting").

After using communities like Reddit's r/guessmybf to get subjective feedback on my own progress, I saw a unique opportunity. I decided to combine my passion for fitness with my new skills in machine learning to create a tool that could automate this process, providing a data-driven estimate of body fat percentage from a simple physique photo.

## The Data Journey
Every machine learning project begins with data, and this one presented a significant challenge right away.

Initial Approach & The Data Scarcity Problem
My initial goal was to train the model on a "gold standard" dataset: physique photos paired with medical-grade body fat scans (like DEXA or MRI). However, extensive searching revealed that this type of public data is extremely rare and insufficient for training a robust model.

Pivoting the Data Strategy
Faced with this data scarcity, I pivoted my strategy. Instead of aiming for medical-grade precision, I decided to build a model that could learn from and replicate the "crowd-sourced wisdom" of experienced fitness communities. The new goal was to train a model on thousands of public physique photos and the corresponding community-estimated body fat percentages.

The data was sourced from two subreddits, r/guessmybf and r/bulkorcut, using a custom Python script with the PRAW (Python Reddit API Wrapper) package for asynchronous API calls.

## Data Cleaning with AI & Prompt Engineering
A major hurdle was cleaning the comment data. Many comments contained jokes or sarcasm, which skewed simple numerical averaging. To solve this, I engineered a solution using the OpenAI API (GPT-4) to act as an intelligent data filter.

Each post's comment array was passed to the API with a carefully crafted prompt designed to isolate and normalize only the serious estimates:

```
You extract body fat % predictions from a Python array of Reddit comments.
Return an array of the predictions in integer form. Ignore arbitrary numbers.
If the user gives a range (like 12-15%), return the mean.
Output only a valid Python list of integers, like [12, 18, 22].
This AI-driven cleaning process was instrumental in creating a reliable training dataset from noisy, real-world text.
```

### Ethical Considerations
Throughout the data collection process, my commitment was to handle public data responsibly. All data was fully anonymized, stripping usernames and any personally identifiable information (PII) before use. The resulting dataset was used exclusively for this non-commercial portfolio project and has not been redistributed.

## The model

Given my little experience with ml models, I decided to use an out of the box framework like fastai to train the image regression models. At first, I used root mean squared error as a loss function, basic augmentation and 20 epochs. Paired with popular models such as Resnet50, I was able to achieve suprisingly good results out of the gate; my best model achieving an RMSE of 9.9. 

In order to optimize the training process, I experimented with different loss functions - root mean cubed error, huber loss, SmoothL1Loss - however, the most simple and effictive was MSE (mean squared error). Besides returning the best results, MSE was easy to understand conceptually, as any model's MSE represented it's average percentage error on any prediction. Working with MSE also gave me a goal for my final model: an average error of 2%.