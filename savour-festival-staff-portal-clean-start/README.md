# Savour Festival Staff Portal

Vercel-ready React/Vite app for staff onboarding, event setup, shift allocation, clock-ins, invoices, Google Workspace connection, and rota exports.

## Clean-start data

This build removes the previous Google AI Studio demo/test data.

- Events start empty.
- Shifts start empty.
- Time logs start empty.
- Invoices start empty.
- Staff test accounts/buttons have been removed from the login page.
- One bootstrap coordinator account remains so you can log in and create the first real event/staff invitations.

Bootstrap coordinator login:

- Email: `dayne@savourfestival.com`
- Access code: set `VITE_ADMIN_ACCESS_CODE` in Vercel, or use the temporary fallback `admin2026` until you change it.

After deployment, the app performs a one-time localStorage cleanup for browsers that previously loaded the demo build. This clears old `fest_*` app data and starts the portal clean.

## Vercel settings

- Framework Preset: Vite
- Root Directory: blank, unless the app is inside a subfolder
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

## Recommended environment variables

Add these in Vercel Project Settings > Environment Variables:

- `VITE_ADMIN_ACCESS_CODE`
- `VITE_STAFF_ACCESS_CODE`

Firebase/Google config is currently read from `firebase-applet-config.json`. Keep that file aligned with your Firebase project.
