# Suffix Monorepo

A full-stack monorepo for a dynamic marketing site with an Admin panel.

- Frontend: React + Vite + React Router
- Backend: Node.js + Express + Sequelize (MySQL)
- Media: Cloudinary uploads
- Admin auth integration: Firebase Admin for password management (see server docs)

## Repository Layout

- client — Vite React app (public website + admin UI)
- server — Express API (content, images, enquiries, auth)
- README.md — this root guide

## Prerequisites

- Node.js 18+
- MySQL 8.x (or compatible)
- Cloudinary account (optional but recommended for image hosting)

## Quick Start

1. Install all dependencies

```
npm run install-all
```

2. Configure environments

- Server requires a .env file. Use the keys listed under “Server Environment” below.
- Client uses Vite variables in client/.env (see “Client Environment” below).

3. Create database

```
CREATE DATABASE suffix_db;
```

4. Seed initial data (admin user, sample content)

```
npm run seed
```

5. Run the stack in development

```
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- Admin: http://localhost:5173/admin/login

## Scripts (Root)

- dev — starts server (nodemon) and client concurrently
- server — start only the server
- client — start only the client
- install-all — installs root, then server, then client
- build — builds client, ensures server deps installed
- start — production server (serves built client if NODE_ENV=production)
- seed — seeds DB with admin and content

## Client Environment

Create client/.env with:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Server Environment

Create server/.env with:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=suffix_db
DB_DIALECT=mysql

# Cloudinary (optional but required for image uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (OTP/password reset)
# Option A: host+port
EMAIL_HOST=smtp.example.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=...
EMAIL_PASS=...
# Option B: service
# EMAIL_SERVICE=gmail
# EMAIL_USER=...
# EMAIL_PASS=...

# Firebase Admin (for password reset/login bootstrap)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=\"...\\n...\\n...\"
```

Notes:
- FIREBASE_PRIVATE_KEY must preserve line breaks; escape them as \\n in .env.
- If Cloudinary variables are not set, image seeding and uploads will be skipped.

## Features Overview

- Content Management: Key-value content stored in SQL via Sequelize.
- Image Uploads: Uploaded to Cloudinary; metadata persisted in DB.
- Admin Users: Stored in SQL; Firebase Admin ensures email/password workflows for login/reset.
- Sections & Pages: DynamicPage renders CMS-defined sections; smooth scrolling respects fixed navbar height.

## Production

1. Build the client

```
npm run build
```

2. Start the server

```
npm start
```

With NODE_ENV=production, Express serves client/dist as static assets and routes all unknown requests to index.html.

## Security and Secrets

- Never commit .env files; both client and server .gitignore already exclude them.
- Provide secrets via environment variables in production (e.g., CI/CD or host-level configuration).

## Troubleshooting

- MySQL connection fails: verify DB_USER/DB_PASS/DB_HOST/DB_NAME and that the DB exists.
- Image uploads fail: ensure Cloudinary credentials are present and valid.
- Email sending fails: check SMTP/service credentials and ports; many providers require app passwords.
- Firebase Admin not initialized: all three variables must be present; check escaping of private key newlines.
