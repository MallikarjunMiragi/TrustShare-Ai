# TrustShareAI AI Engine

This folder contains the optional Python microservice for AI-powered trust analysis and item recommendations.

## What it does

- consumes backend trust features
- returns AI-style trust analysis for the dashboard
- returns personalized item recommendations for the marketplace
- acts as a microservice that the Node backend can call

## Endpoints

- `GET /health`
- `POST /trust-score`
- `POST /recommendations`

## Run locally

```bash
cd ai-engine
python3 -m pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Then add this to the backend `.env`:

```env
AI_ENGINE_URL=http://localhost:8000
```

If the AI service is not running, the backend automatically falls back to an embedded AI inference layer so the app keeps working.
