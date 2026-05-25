from fastapi import FastAPI

from recommender import build_recommendations
from trust_model import analyze_trust


app = FastAPI(title="TrustShareAI AI Engine", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "service": "trustshare-ai-engine"}


@app.post("/trust-score")
def trust_score(payload: dict):
    return {"source": "python-fastapi", "analysis": analyze_trust(payload)}


@app.post("/recommendations")
def recommendations(payload: dict):
    return build_recommendations(payload)
