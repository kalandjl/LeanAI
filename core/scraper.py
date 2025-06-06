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

import asyncpraw

reddit = asyncpraw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent="LeanAIApp/0.1 by mythic_lisp",
)

# OpenAI client
client = openai.OpenAI(api_key=openai_api_key)

# FastAPI app
app = FastAPI()

import ast


def extract_bf_prediction_from_comments(comments):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You extract body fat % predictions from a Python array of Reddit comments. "
                        "Return an array of the predictions in integer form. Ignore arbitrary numbers. "
                        "If the user gives a range (like 12-15%), return the mean. "
                        "Output only a valid Python list of integers, like [12, 18, 22]."
                    )
                },
                {
                    "role": "user",
                    "content": f"Comments: {comments}\nWhat are the bodyfat percentage guesses in this list? Respond only with the list, no text."
                }
            ],
            max_tokens=100,
            temperature=0.2,
        )

        text = response.choices[0].message.content.strip()

        # Try to safely parse the list using ast.literal_eval
        parsed = ast.literal_eval(text)

        # Ensure it's a list of integers in range 1–50
        if isinstance(parsed, list):
            return [int(x) for x in parsed if isinstance(x, int) and 1 <= x <= 50]
        else:
            return []

    except Exception as e:
        print(f"OpenAI error: {e}")
        return []

def is_image_url(url: str) -> bool:
    return any(url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp"])

def median(numbers):
    if not numbers:
        return None  # or raise an error

    numbers = sorted(numbers)
    n = len(numbers)
    mid = n // 2

    if n % 2 == 0:
        return (numbers[mid - 1] + numbers[mid]) / 2
    else:
        return numbers[mid]
    
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

    possiblePredComments = []

    for comment in post.comments.list():
        if looks_like_bf_guess(comment.body): possiblePredComments.append(comment.body)

    bfPredictions = extract_bf_prediction_from_comments(possiblePredComments)

    #empty array of 5
    images = [None, None, None, None, None]

    if "/gallery/" in post.url:
        scraped_images = scrape_gallery_images('https://www.reddit.com' + post.permalink)

        i = 0
        for scraped_image in scraped_images:
            if i<4: images[i] = scraped_image
            i+=1
    elif is_image_url(post.url): images[0] = post.url



    if len(bfPredictions) == 0 or images == [None] * 5:
        return None
    


    return {
        "title": post.title,
        "url": post.url,
        "meanPrediction": round(statistics.mean(bfPredictions), 2),
        "medianPrediction": median(bfPredictions),
        "bfPredictions": bfPredictions,
        "image_1": images[0],
        "image_2": images[1],
        "image_3": images[2],
        "image_4": images[3],
        "image_5": images[4],
    }

import requests
from bs4 import BeautifulSoup

# for multiple image posts where image url isn't explicitly given
def scrape_gallery_images(reddit_url: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    res = requests.get(reddit_url, headers=headers)
    if res.status_code != 200:
        print(f"Failed to fetch page: {reddit_url}")
        return []

    soup = BeautifulSoup(res.text, "html.parser")

    # Select all <img> tags with the given class
    image_tags = soup.select("img.media-lightbox-img")

    images =[]
    for i, img in enumerate(image_tags[:5], start=1):
        src = img.get("src")
        lazysrc = img.get("data-lazy-src")
        if src:
            images.append(src)
        elif lazysrc:
            images.append(lazysrc)

    return images

@app.get("/auth/reddit/getPosts")
async def get_reddit_posts():
    posts = []
    subreddit = await reddit.subreddit("guessmybf")

    executor = ThreadPoolExecutor(max_workers=5)

    i = 0  # Track post count manually
    async for post in subreddit.top(time_filter="all", limit=999):

        await post.load()

        if post.stickied:
            continue

        i += 1
        print(f"Processing post {i}...")

        try:
            result = await asyncio.wait_for(
                asyncio.get_event_loop().run_in_executor(executor, process_post_sync, post),
                timeout=15  # seconds
            )
            if result:
                posts.append(result)
                print(f"✅ Post {i}: {result['title']}")
            else:
                print(f"⚠️ Skipped post {i}: no predictions or no image")

        except asyncio.TimeoutError:
            print(f"⏱️ Timeout on post {i}: {post.title}")
        except Exception as e:
            print(f"❌ Error on post {i}: {e}")

    df = pd.DataFrame(posts)
    df.to_csv("guessmybf_dataset.csv", index=False)

    return {"posts": posts}