from dotenv import load_dotenv
import os

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

@app.get("/auth/reddit/getPosts")
async def get_reddit_posts():
    subreddit = reddit.subreddit("learnpython")
    posts = []
    for post in subreddit.hot(limit=5):
        posts.append({"id": post.id, "title": post.title})
    return {"posts": posts}
