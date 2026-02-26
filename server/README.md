# Server (Express + Sequelize)

Node.js API powering content, images, enquiries, and admin auth integration.

## Tech Stack

- Express 5
- Sequelize ORM (MySQL by default)
- Multer (uploads to temp dir) + Cloudinary (persistent image hosting)
- Nodemailer (OTP email)
- Firebase Admin (bootstraps/updates admin credentials for login/reset)

## Prerequisites

- Node.js 18+
- MySQL 8.x (or compatible)
- Optional: Cloudinary account for media

## Environment Variables

Create server/.env with:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=suffix_db
DB_DIALECT=mysql

# Cloudinary (required for uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (OTP)
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

# Firebase Admin
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=\"...\\n...\\n...\"
```

Notes:
- DB_DIALECT defaults to mysql.
- Firebase private key must escape line breaks as \\n.
- If Cloudinary vars are missing, image uploads and seeding uploads will be skipped.

## Installation

```
npm install
```

## Development

```
npm run dev
```

Starts on http://localhost:5000 and logs “MySQL Connected…” once the DB is reachable.

## Production

```
npm start
```

If NODE_ENV=production, the server can serve the built client from ../../client/dist.

## Database & Models

- Sequelize connection configured in src/config/db.js
- On startup, sequelize.sync() ensures tables exist.
- Core models:
  - User: username, email, password (bcrypt-hashed), resetOtp, resetOtpExpires
  - Content: key, value (JSON) for CMS-like storage
  - Image: imageUrl, imagePublicId (Cloudinary)
  - Enquiry: simple contact/enquiry storage

## Seeding

```
node ../seed.js
```

Seeds or updates:
- Default admin user (see seed.js for initial credentials)
- Example content for navbar, hero, about, products, success, image grid, footer
- Optional image uploads to Cloudinary (if credentials present)

## API Overview

Base URL: `/api`

- Auth `/api/auth`
  - POST `/login` — Accepts { username, password }. Ensures a Firebase user exists for the email and returns user profile.
  - POST `/register` — Protected. Creates a new user (local + Firebase).
  - GET `/users` — Protected. Lists admin users.
  - DELETE `/users/:id` — Protected. Deletes user (local + Firebase).
  - POST `/forgot-password` — Sends OTP to email.
  - POST `/verify-otp` — Verifies OTP for a user.
  - POST `/reset-password` — Resets password (updates local + Firebase).

- Content `/api/content`
  - GET `/` — List all content entries.
  - GET `/:key` — Get content by key (e.g., navbar, pages, page-home).
  - PUT `/` — Protected. Upsert content by key with value JSON.

- Images `/api/images`
  - POST `/` — Upload image (multipart/form-data, field: image). Saves to Cloudinary and DB.
  - PUT `/:id` — Replace image by ID.
  - DELETE `/:id` — Delete image and remove from Cloudinary.

- Enquiries `/api/enquiries`
  - POST `/` — Create a new enquiry.
  - GET `/` — List enquiries (optional filters).
  - PUT `/:id` — Update an enquiry.
  - DELETE `/:id` — Delete an enquiry.

Notes:
- Current auth middleware is a placeholder that allows all requests to pass through. Replace protect in src/middleware/authMiddleware.js with proper token verification for production.

## File Uploads

- Multer stores incoming files in the OS temp directory.
- After upload to Cloudinary, the temp file is removed.

## Logging & Errors

- Start-up logs connection details and route mounts.
- Controllers return standard JSON error messages with status codes.

## Troubleshooting

- “Unable to connect to the database”: verify MySQL is running and .env values.
- “Failed to send OTP email”: verify SMTP/service credentials and ports.
- “Firebase Admin credentials not fully provided”: supply all three variables and ensure the private key is correctly escaped.

