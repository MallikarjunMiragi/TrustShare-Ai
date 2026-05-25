# TrustShareAI

TrustShareAI is an intelligent community resource sharing platform for closed communities such as hostels, campuses, apartments, and student residences. It allows members to borrow physical items from one another without monetary transactions while using a trust-first workflow, community access control, and a modern glassmorphism user interface.

## Core Idea

Instead of buying rarely used items, members of a trusted community can share them. TrustShareAI helps users:

- list items they are willing to lend
- browse community items
- request items for a specific duration
- approve or reject borrow requests
- track returns and ratings
- view trust score, trust history, and badges
- manage risky behaviour using admin controls

## Tech Stack

### Frontend

- React
- Vite
- TailwindCSS
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Cloudinary
- Nodemailer

### AI Layer

- FastAPI microservice in `ai-engine/`
- backend fallback inference if the Python service is unavailable

## Project Structure

```text
trustshare-ai/
  client/          React frontend
  server/          Express backend
  ai-engine/       AI trust analysis and recommender microservice
  reports/         Report and jury documentation
```

## Main Features

- community-based registration using invite codes
- secure login with JWT authentication
- item listing, search, filters, and detail pages
- borrow request workflow with pending, approved, rejected, active, and returned states
- ratings and reviews after borrowing
- multi-parameter trust engine with anti-gaming logic
- credit points and badges
- trust transparency modal and trust history chart
- admin dashboard for member monitoring and control
- Cloudinary image upload
- email notifications for borrow lifecycle events

## Trust and AI Highlights

The trust engine uses a multi-parameter scoring model instead of simple average rating. It considers:

- punctuality
- completion rate
- rating quality
- item care
- community contribution
- interaction diversity
- account verification
- responsiveness
- high-value item handling

It also applies anti-gaming controls such as:

- rating concentration penalty
- repeated counterparty concentration penalty
- overdue exposure penalty
- signal mismatch detection
- limited-history confidence caps

On top of the trust engine, the product now includes:

- AI trust analysis on the dashboard
- AI-generated positive and risk driver explanations
- AI-powered item recommendations on the marketplace
- AI-assisted suggested borrow duration in the borrow modal

## Local Setup

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Default backend port:

```text
http://localhost:5002
```

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Default frontend Vite URL:

```text
http://localhost:5173
```

## Environment Variables

### Frontend `client/.env`

```env
VITE_API_URL=http://localhost:5002/api
```

### Backend `server/.env`

```env
PORT=5002
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
AI_ENGINE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=TrustShareAI <your_email>
```

## Demo Dataset

If you want realistic sample data for evaluation, use:

```bash
cd server
npm run seed:demo
```

This seeds:

- a realistic community
- multiple users
- shared items
- borrow request history
- ratings
- trust history and trust timeline events

## Run the AI Engine

To run the separate Python AI microservice:

```bash
cd ai-engine
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Then set this in the backend environment:

```env
AI_ENGINE_URL=http://localhost:8000
```

If the AI service is not running, the backend automatically falls back to the embedded inference layer so the product still works.

## Deployment

### Backend on Render

If your GitHub repo root directly contains `client/`, `server/`, and `ai-engine/`, then:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

Required backend environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `NODE_ENV=production`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

Important for MongoDB Atlas:

- add the Render access IP or temporarily allow `0.0.0.0/0` during testing

### Frontend on Vercel

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`

Required frontend environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

The frontend includes `client/vercel.json` for SPA routing support.

## API Overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Community

- `GET /api/communities/me`
- `PATCH /api/communities/invite-code`

### Items

- `GET /api/items`
- `POST /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id`
- `PATCH /api/items/:id/availability`

### Borrow Requests

- `POST /api/borrows`
- `GET /api/borrows`
- `PATCH /api/borrows/:id/approve`
- `PATCH /api/borrows/:id/reject`
- `PATCH /api/borrows/:id/return`

### Ratings and Trust

- `POST /api/ratings`
- `GET /api/trust/history`
- `GET /api/trust/timeline`

### AI

- `GET /api/ai/trust-analysis`
- `GET /api/ai/recommendations`

### Dashboard

- `GET /api/dashboard`

### Uploads

- `POST /api/uploads/image`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/profile`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/limits`
- `PATCH /api/admin/users/:id/reset-trust`
- `PATCH /api/admin/users/:id/clear-trust-override`

## Files Helpful for Final Evaluation

- `reports/TrustShareAI_Project_Report.docx`
- `reports/TrustShareAI_Project_Report.md`
- `reports/JURY_DEMO_GUIDE.md`

## Notes

- frontend build was verified successfully
- backend health check and major API flows were smoke-tested successfully
- for final evaluation, keep both hosted demo and local fallback ready
