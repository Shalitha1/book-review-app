# Leaf & Letter — Book Review App

A production-ready three-tier book review application with a Next.js frontend, an Express API, and a MySQL database.

## Features

- Responsive editorial-style book library
- Search, rating filters, and sorting
- Book details with community rating summaries
- JWT-based registration and sign-in
- Create, edit, and delete your own reviews
- Accessible star-rating controls and form feedback
- Loading, empty, and error states
- Same-origin `/api` routing for private backend deployments

## Architecture

```text
Browser
  └── Public ALB
       └── Web EC2 / Nginx
            ├── /      → Next.js :3000
            └── /api/* → Internal ALB :3001
                           └── App EC2 / Express :3001
                                └── RDS MySQL :3306
```

## Local setup

### Backend

```bash
cd backend
npm ci
cp .env.example .env
# Fill in the database and JWT values in .env
npm start
```

### Frontend

```bash
cd frontend
npm ci
cp .env.example .env.local
# For local development, set NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

The frontend is available on `http://localhost:3000`; the API uses port `3001`.

## Production configuration

Keep the real backend `.env` on the App EC2 instance and never commit it. Required values:

```dotenv
PORT=3001
DB_HOST=<rds-endpoint>
DB_PORT=3306
DB_NAME=bookreview
DB_USER=<database-user>
DB_PASS=<database-password>
JWT_SECRET=<long-random-secret>
```

For the existing Nginx reverse proxy, leave `NEXT_PUBLIC_API_URL` unset or empty during the frontend build. Browser requests then use `/api`, which Nginx forwards to the internal ALB. No RDS schema change is required by the review edit/delete feature.

The API only creates missing tables at startup. Apply future database changes through explicit migrations rather than Sequelize `alter: true`, which can repeatedly create MySQL indexes during PM2 restarts.

## Verification

```bash
cd frontend
npm run lint
npm run build

cd ../backend
npm run check
```

## Deployment safety

Deploy into a new release directory first. Preserve the current `.env` files, build the frontend, install backend production dependencies, test both health endpoints, and only then restart the existing PM2 processes. Keep the previous directory until the public ALB and internal ALB health checks pass.
