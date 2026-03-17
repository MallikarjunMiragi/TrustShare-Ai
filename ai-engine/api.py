"""Placeholder FastAPI service for AI trust scoring."""

from fastapi import FastAPI
from trust_model import score_user

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/trust-score")
def trust_score(payload: dict):
    score = score_user(payload)
    return {"trustScore": score}
