from dotenv import load_dotenv
import os
import re
import statistics
import openai
import pandas as pd
from fastapi import FastAPI
from concurrent.futures import ThreadPoolExecutor

# uvicorn scraper:app --host 127.0.0.1 --port 3000 --reload
# Load environment variables
load_dotenv()

client_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")
openai_api_key = os.getenv("OPENAI_API_KEY")

import praw



reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent="LeanAIApp/0.1 by mythic_lisp",
)

# OpenAI client
client = openai.OpenAI(api_key=openai_api_key)

# FastAPI app
app = FastAPI()

def extract_bf_prediction_from_comment(comment: str) -> float | None:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You extract body fat % predictions from Reddit comments. If no prediction is made, respond with 'null'. Only include a number if it is a body fat percentage guess."},
                {"role": "user", "content": f"Comment: \"{comment}\"\nWhat is the body fat percentage guess? Respond only with the number or 'null'."}
            ],
            max_tokens=10,
            temperature=0.2,
        )
        text = response.choices[0].message.content.strip().lower()
        if "null" in text:
            return None
        match = re.search(r"\d{1,2}", text)
        if match:
            val = int(match.group())
            return val if 1 <= val <= 50 else None
    except Exception as e:
        print(f"OpenAI error: {e}")
    return None

def is_image_url(url: str) -> bool:
    return any(url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])

import re

def looks_like_bf_guess(text: str) -> bool:
    """Returns True if text contains a number between 1 and 50 (inclusive)."""
    matches = re.findall(r"\b\d{1,2}\b", text)
    return any(1 <= int(m) <= 50 for m in matches)

def is_image_url(url):
    image_domains = ["i.redd.it", "i.imgur.com"]
    return any(domain in url for domain in image_domains)

import asyncio

# This will be run in a thread
def process_post_sync(post):
    post.comments.replace_more(limit=None)
    bfPredictions = []

    for comment in post.comments.list():
        if not looks_like_bf_guess(comment.body):
            continue
        pred = extract_bf_prediction_from_comment(comment.body)
        if pred is not None:
            bfPredictions.append(pred)

    if not bfPredictions or not is_image_url(post.url):
        return None

    return {
        "title": post.title,
        "meanPrediction": round(statistics.mean(bfPredictions), 2),
        "bfPredictions": bfPredictions,
        "image_url": post.url
    }

@app.get("/auth/reddit/getPosts")
async def get_reddit_posts():
    posts = []
    subreddit = reddit.subreddit("guessmybf")

    executor = ThreadPoolExecutor(max_workers=5)

    for i, post in enumerate(subreddit.hot(limit=999)):
        if post.stickied:
            continue

        print(f"Processing post {i + 1}...")

        try:
            result = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(executor, process_post_sync, post),
                timeout=15  # seconds
            )
            if result:
                posts.append(result)
                print(f"✅ Post {i + 1}: {result['title']}")
            else:
                print(f"⚠️ Skipped post {i + 1}: no predictions or no image")

        except asyncio.TimeoutError:
            print(f"⏱️ Timeout on post {i + 1}: {post.title}")
        except Exception as e:
            print(f"❌ Error on post {i + 1}: {e}")

    df = pd.DataFrame(posts)
    df.to_csv("guessmybf_dataset.csv", index=False)

    return {"posts": posts}