# TrustShareAI

Intelligent community resource sharing platform with a glassmorphism UI and a trust-first backend.

## Tech Stack
- Frontend: React + Vite + TailwindCSS + Framer Motion + shadcn/ui patterns
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Optional AI: FastAPI microservice stubs

## Project Structure
```
trustshare-ai/
  client/          # React app
  server/          # Express API
  ai-engine/       # Optional AI services (stubs)
```

## Local Setup (once network access is available)
### Frontend
```
cd trustshare-ai/client
cp .env.example .env
npm install
npm run dev
```

### Backend
```
cd trustshare-ai/server
cp .env.example .env
npm install
npm run dev
```

## Environment Variables
Frontend (`trustshare-ai/client/.env`)
- `VITE_API_URL` (default `http://localhost:5000/api`)

Backend (`trustshare-ai/server/.env`)
- `MONGO_URI` MongoDB Atlas connection string
- `JWT_SECRET` secret key for JWT
- `JWT_EXPIRES_IN` token lifetime (default 7d)

## Deploy (Render + Vercel)
### Backend on Render
1. Push this repo to GitHub.
2. Create a **Render Web Service** and select the repo.
3. Set **Root Directory** to `trustshare-ai/server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add env vars in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL` = your Vercel app URL (e.g. `https://your-app.vercel.app`)
   - `NODE_ENV=production`
   - Optional: Cloudinary + Email credentials

### Frontend on Vercel
1. Import the repo in Vercel.
2. Set **Root Directory** to `trustshare-ai/client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add env var:
   - `VITE_API_URL=https://<your-render-app>.onrender.com/api`

### SPA Routing
Vercel uses `trustshare-ai/client/vercel.json` to handle client‑side routing.

## API Overview
- `POST /api/auth/register` (inviteCode required unless creating a community)
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/communities`
- `GET /api/communities/me`
- `PATCH /api/communities/invite-code`
- `GET /api/items`
- `POST /api/items`
- `GET /api/items/:id`
- `PATCH /api/items/:id` (owner updates item details/image)
- `PATCH /api/items/:id/availability`
- `POST /api/uploads/image`
- `GET /api/trust/profile`
- `GET /api/trust/history`
- `GET /api/trust/timeline`
- `GET /api/admin/overview` (community admin only)
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/limits`
- `PATCH /api/admin/users/:id/reset-trust`
- `PATCH /api/admin/users/:id/clear-trust-override`
- `POST /api/borrows`
- `GET /api/borrows`
- `PATCH /api/borrows/:id/approve`
- `PATCH /api/borrows/:id/reject`
- `PATCH /api/borrows/:id/return`
- `POST /api/ratings`
- `GET /api/dashboard`

## Notes
- The UI uses glassmorphism styles and Framer Motion animations across key screens.
- Trust score is recalculated after ratings using a weighted formula based on average rating and return rate.
- Goodness points are awarded on approvals and returns (adjust as needed).
- Image uploads use Cloudinary (`/api/uploads/image`) and email notifications use Nodemailer.
- Admins can access the community management screen at `/community` to refresh invite codes.
