# Suffix Project

A dynamic website with an Admin Panel, built with React (Vite) and Node.js (Express, MySQL/Sequelize).

## Prerequisites

- Node.js (v18+)
- MySQL Server

## Setup

1.  **Install Dependencies**
    Run this command in the root directory to install dependencies for both client and server:
    ```bash
    npm run install-all
    ```

2.  **Environment Variables**
    Create a `.env` file in the `server` directory (or root if configured) based on `.env.example`.
    ```bash
    cp .env.example server/.env
    ```
    Update the values in `server/.env`:
    - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`: Your MySQL credentials.
    - `CLOUDINARY_*`: Your Cloudinary credentials for image uploads.
    - `JWT_SECRET`: A secure random string.

    **Note:** Ensure the MySQL database (e.g., `suffix_db`) exists. You can create it via MySQL CLI or Workbench:
    ```sql
    CREATE DATABASE suffix_db;
    ```

3.  **Seed Database**
    Populate the database with initial content and the default admin user.
    ```bash
    npm run seed
    ```
    *Default Admin Credentials:*
    - Email: `admin@suffix.com`
    - Password: `admin123`

## Development

Run both client and server concurrently:
```bash
npm run dev
```
- Client: `http://localhost:5173`
- Server: `http://localhost:5000`
- Admin Panel: `http://localhost:5173/admin/login`

## Deployment

1.  **Build Client**
    ```bash
    npm run build
    ```
    This builds the React app into `client/dist`.

2.  **Start Server**
    In production, the server will serve the static files from `client/dist`.
    ```bash
    npm start
    ```

## Project Structure

- `client/`: React frontend (Vite)
  - `src/components/`: Reusable components
  - `src/pages/`: Page components (including Admin)
  - `src/services/`: API integration
- `server/`: Express backend
  - `src/models/`: Sequelize models (User, Content)
  - `src/controllers/`: Business logic
  - `src/routes/`: API routes
  - `src/config/`: Configuration (DB, Cloudinary)

## Features

- **Admin Panel**: Manage all website content (Navbar, Hero, About, Products, etc.).
- **User Management**: Create/Delete admin users, Change Password.
- **Dynamic Content**: Frontend fetches content from MySQL database.
- **Image Upload**: Integrated with Cloudinary.
- **Authentication**: JWT-based protected routes.
