from dotenv import load_dotenv
import os
import re
import statistics


load_dotenv()  # loads variables from .env into environment

client_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")

from fastapi import FastAPI

import praw

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent="LeanAIApp/0.1 by mythic_lisp",
)

app = FastAPI()

def extract_numbers_in_range(text, min_val=1, max_val=50):
    # Finds all integers in text between min_val and max_val inclusive
    nums = [int(num) for num in re.findall(r'\b(\d+)\b', text)]
    return [num for num in nums if min_val <= num <= max_val]

@app.get("/auth/reddit/getPosts")
async def get_reddit_posts():
    subreddit = reddit.subreddit("guessmybf")
    posts = {}

    for post in subreddit.hot(limit=50):

        if post.stickied: continue

        bfPredictions = []
        post.comments.replace_more(limit=None)
        for comment in post.comments.list():
            nums = extract_numbers_in_range(comment.body)
            if nums:
                bfPredictions.extend(nums)
        
        if len(bfPredictions) == 0: continue 

        posts[post.id] = {
            "title": post.title,
            "bfPredictions": bfPredictions,
            "meanPrediction": round(statistics.mean(bfPredictions), 2) if bfPredictions else None

        }

    return {"posts": posts}
