
# ReLife Nexus

AI-powered circular resource intelligence for institutional laptops, monitors, projectors, and printers.

> How might we use AI to determine the most sustainable next action for institutional assets so that organizations can reduce unnecessary procurement, extend asset lifecycles, and prevent usable resources from becoming waste?

## Current prototype

This runnable prototype uses a validated deterministic decision engine and synthetic demo data. It demonstrates asset analysis, safety/evidence gates, resource matching, approval states, impact limitations, and an enterprise dashboard. External AI, MongoDB, document extraction, and vector storage are isolated behind configuration and are not claimed as connected without credentials.

## Run locally

```bash
# ReLife Nexus frontend

Next.js dashboard for the ReLife Nexus backend.

## Run

Start the backend first:

```powershell
cd ..\backend
npm install
npm run dev
```

In a second terminal:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The Next.js API proxy forwards requests to `BACKEND_URL`.

The UI does not fabricate analysis results. Asset analysis requires a reachable MongoDB backend and `AI_API_KEY`.

