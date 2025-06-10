from fastapi import FastAPI
app = FastAPI()

@app.post("/")
def root(data: dict):
    return {"received": data}
