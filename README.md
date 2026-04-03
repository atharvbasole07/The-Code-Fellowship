# The-Code-Fellowship
Smart waste systems use IoT sensors to monitor bin fill levels in real time. Data is sent to a central dashboard for alerts and route optimization. This reduces fuel use, costs, and overflow, improving cleanliness and enabling efficient, scalable urban waste management.
TEAM MEMBERS
<br>
1)ARMAN RAMJAN SHAIKH
<br>
2)ATHARV MANGESH BASOLE
<br>
3)DEEP VAIBHAV LOKHANDE
<br>
4)JANHAVI NITIN CHAUHAN

# BinWatch

BinWatch is a React 18 + Vite municipal smart waste management dashboard with a Supabase-ready backend model, realtime subscriptions, collection workflows, analytics, mapping, and a citizen issue-reporting preview.

## Stack

- React 18 + Vite
- Tailwind CSS v3
- Supabase Auth / PostgreSQL / Realtime
- Recharts
- React Router v6
- React Leaflet + OpenStreetMap
- Lucide React

## Run locally

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env`
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Start with `npm run dev`

The UI also includes a demo data mode when Supabase environment variables are not set, so the website still renders for design and interaction review.

## Supabase

- Schema and policies: [supabase/schema.sql](./supabase/schema.sql)
- Seed data: [supabase/seed.sql](./supabase/seed.sql)

The citizen issue form maps public issue types into the existing `alerts.type` constraint:

- `overflow` -> `overflow_risk`
- `odor` -> `odor_spike`
- `damage` -> `tamper`
- `illegal dumping` -> `tamper`
