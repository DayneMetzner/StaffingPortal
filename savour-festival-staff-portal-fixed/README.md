# Savour Festival Staff Portal

React + Vite staff onboarding, shift management, timeclock, invoice and rota app.

## Deploy on Vercel

Use these settings:

- Framework preset: Vite
- Root directory: leave blank
- Build command: `npm run build`
- Output directory: `dist`

## Login

The app now opens on a login page. For the seeded demo data:

- Admin email: `dayne@savourfestival.com`
- Admin access code: `admin2026`
- Staff example: `alice@festivalstaff.com`
- Staff access code: `staff2026`

Set `VITE_ADMIN_ACCESS_CODE` and `VITE_STAFF_ACCESS_CODE` in Vercel Environment Variables to replace the defaults.

This static build stores operational data in the browser's `localStorage`. For production, connect a backend database and real authentication.

## Google Workspace

The admin view includes a **Connect Google Workspace** button. It uses Firebase Auth plus Gmail/Sheets OAuth scopes. To use it live:

1. Configure `firebase-applet-config.json` with your Firebase web app settings.
2. In Firebase Authentication, enable Google provider.
3. Add your Vercel domain to Firebase Auth authorized domains.
4. Sign in from the admin view, then use staff invitation emails and shift backups.
