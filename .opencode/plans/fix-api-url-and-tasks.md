# Fix: "Failed to load tasks" on Task Review Page

## Problem
The frontend `.env.local` points to `https://online-cms-3xij.onrender.com/api` (Render production server), which returns 404 for `GET /api/tasks/course/:courseId` because it's running an older version without that endpoint.

## Fix
1. Change `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
2. Ensure backend is running locally: `cd backend && npm run dev`

## Changes
- `frontend/.env.local` — update API URL from Render to localhost
