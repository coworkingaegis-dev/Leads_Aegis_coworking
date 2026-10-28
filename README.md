# Aegis CRM

Simple client CRM for Aegis Coworking — React (Vite) + Supabase.

## Setup (10 minutes)

1. **Create the table** — Supabase dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
2. **Create team logins** — Authentication → Users → *Add user* (email + password) for each team member.
   Then Authentication → Sign In / Providers → turn **off** "Allow new users to sign up", so only people you add can log in.
3. **Keys** — copy `.env.example` to `.env` and fill in Project URL + anon key (Project Settings → API).
4. **Run locally**
   ```bash
   npm install
   npm run dev
   ```
5. **Deploy to Vercel** — import the repo, add the same two `VITE_` env vars, deploy. (e.g. `crm.aegiscoworking.ae`)

## How it works

- **Clients** — every lead/client with all fields. Filter by status, search by name/phone/referral.
- **Closed Clients** — any client with status *Closed* appears here automatically
  (name, phone, source, service, KYC, lease agreement, license, Tawtheeq).
- **Referral Clients** — any client with source *Referral* or a referral name
  (name, phone, source, service, referral name, % fee, amount, status Pending/Closed).
- **Amount** = Deal value × Referral % — calculated automatically (also stored by the database).
- Edit and Delete work on every tab; it's one record, so editing from any tab updates all three.
- No field is mandatory.
