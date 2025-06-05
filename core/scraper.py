from dotenv import load_dotenv
import os
import re
import statistics
import openai

from fastapi import FastAPI
import praw

# Load environment variables
load_dotenv()

client_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")

# Reddit API client
reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    user_agent="LeanAIApp/0.1 by mythic_lisp",
)

app = FastAPI()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
@app.get("/auth/reddit/getPosts")
async def get_reddit_posts():
    subreddit = reddit.subreddit("guessmybf")
    posts = {}

    for post in subreddit.hot(limit=50):
        if post.stickied:
            continue

        bfPredictions = []
        post.comments.replace_more(limit=None)

        for comment in post.comments.list():
            pred = extract_bf_prediction_from_comment(comment.body)
            if pred is not None:
                bfPredictions.append(pred)

        if not bfPredictions:
            continue

        posts[post.id] = {
            "title": post.title,
            "bfPredictions": bfPredictions,
            "meanPrediction": round(statistics.mean(bfPredictions), 2)
        }

    return {"posts": posts}
