# TIFFIN FLOW BACKEND

Backend for the Angular Tiffin Flow application.

## Stack
- Node.js
- Express 5
- MySQL 8+
- mysql2/promise
- JWT authentication
- bcryptjs password hashing
- Helmet/CORS/Morgan

## 1. Create the database

Open MySQL Workbench and run:

`database/schema.sql`

Then optionally run:

`database/seed.sql`

## 2. Configure environment

Copy `.env.example` to `.env` and set your MySQL password.

## 3. Install and run

```bash
npm install
npm run dev
```

API:
`http://localhost:5000/api`

Health check:
`GET http://localhost:5000/api/health`

## Main endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Menu
- GET `/api/menu`
- GET `/api/menu/:id`

### Addresses
- GET `/api/addresses`
- POST `/api/addresses`
- PUT `/api/addresses/:id`
- DELETE `/api/addresses/:id`

### Orders
- POST `/api/orders`
- GET `/api/orders/my`
- GET `/api/orders/:id`

### Subscriptions
- POST `/api/subscriptions`
- GET `/api/subscriptions/my`
- PATCH `/api/subscriptions/:id/pause`
- PATCH `/api/subscriptions/:id/cancel`

### Coupons
- POST `/api/coupons/validate`

### Admin
- GET `/api/admin/dashboard`
- POST `/api/admin/menu`
- PUT `/api/admin/menu/:id`
- PATCH `/api/admin/menu/:id/stock`
- GET `/api/admin/orders`
- PATCH `/api/admin/orders/:id/status`

For protected endpoints send:
`Authorization: Bearer <token>`
