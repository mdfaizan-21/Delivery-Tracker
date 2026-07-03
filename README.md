# Last-Mile Delivery Tracker

A full-stack delivery management platform with role-based access control, dynamic rate calculation, intelligent agent auto-assignment, and real-time order tracking.

---

## 🌐 Deployed Application

| Service         | Platform          | URL                                                                                                    |
| --------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**    | Vercel            | [https://lastmile-delivery-tracker-gray.vercel.app](https://lastmile-delivery-tracker-gray.vercel.app) |
| **Backend API** | Render            | `https://delivery-tracker-bu0m.onrender.com`                                                           |
| **Database**    | Neon (PostgreSQL) |

> ⚠️ **Note:** The Render free tier **spins down after 15 minutes of inactivity**. The first API call after a sleep period may take 20–30 seconds to respond. This is expected behavior.

---

## 🔑 Test Credentials (Live Deployed App)

Use these pre-registered accounts to test the live application without registering:

| Role         | Email                     | Password   |
| ------------ | ------------------------- | ---------- |
| **Admin**    | `testadmin@deploy.com`    | `Test1234` |
| **Customer** | `testcustomer@deploy.com` | `Test1234` |
| **Agent**    | `agent1@deploy.com`       | `Test1234` |

### Quick Login Links

- Admin Dashboard → [/login](https://lastmile-delivery-tracker-gray.vercel.app/login) → login as Admin → redirects to `/admin`
- Customer Dashboard → [/login](https://lastmile-delivery-tracker-gray.vercel.app/login) → login as Customer → redirects to `/customer`
- Agent Dashboard → [/login](https://lastmile-delivery-tracker-gray.vercel.app/login) → login as Agent → redirects to `/agent`

---

## 🧪 End-to-End Test Flow

Follow this sequence to test the full delivery lifecycle:

1. **Login as Admin** → Zones tab → Create zones (Zone A, Zone B, Zone C, Zone D)
2. **Admin** → Rate Cards tab → Create rate cards for zone pairs (B2B and B2C)
3. **Login as Customer** → Place New Order → Calculate Quote → Confirm
4. **Login as Agent** → Update status: Assigned → Picked Up → In Transit → Out for Delivery → Delivered
5. **Login as Customer** → My Orders → View tracking timeline

---

## Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| Backend       | Java 17, Spring Boot 3.2, Spring Security (JWT), Hibernate/JPA |
| Database      | PostgreSQL (Neon Cloud)                                        |
| Frontend      | Next.js 16, React 19, Axios, Vanilla CSS                       |
| Notifications | JavaMailSender (Mailtrap SMTP)                                 |

---

## Project Structure

```
LastMile_delivery/
├── backend/          # Spring Boot REST API
│   ├── Dockerfile              # Docker build config for Render deployment
│   └── src/main/java/com/example/lastmile/
│       ├── controller/     # REST Controllers (Admin, Agent, Customer, Auth)
│       ├── model/          # JPA Entities (Order, User, Zone, RateCard, OrderTrackingHistory)
│       ├── repository/     # Spring Data JPA repositories
│       ├── service/        # Business logic (OrderService, RateEngineService, AgentAssignmentService, NotificationService)
│       └── security/       # JWT auth filters and UserDetailsService
├── frontend/         # Next.js web application
│   └── src/app/
│       ├── admin/         # Admin dashboard (zones, rate cards, orders)
│       ├── agent/         # Agent dashboard (status updates)
│       ├── customer/      # Customer dashboard (order placement, tracking)
│       ├── login/         # Login page
│       └── register/      # Registration page
├── database/         # Docker-compose + schema.sql
├── SYSTEM_DESIGN.md  # Architecture writeup
└── README.md
```

---

## Local Setup

### Prerequisites

- Java 17+
- Node.js 18+
- Maven (or use included `./mvnw`)
- PostgreSQL (or use the provided Neon cloud URL)

### 1. Database

**Option A — Cloud (Neon, pre-configured):**  
Already configured in `backend/src/main/resources/application.yml`. No action needed.

**Option B — Local Docker:**

```bash
cd database
docker-compose up -d
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

---

## Environment Variables / `.env.example`

```yaml
DATABASE_URL       # PostgreSQL JDBC connection string
DATABASE_USERNAME  # DB user
DATABASE_PASSWORD  # DB password
JWT_SECRET         # 64-char hex secret for JWT signing
MAIL_HOST          # SMTP host (e.g. sandbox.smtp.mailtrap.io)
MAIL_PORT          # SMTP port (e.g. 2525)
MAIL_USERNAME      # SMTP username
MAIL_PASSWORD      # SMTP password
```

### Frontend (`.env.local` or Vercel Environment Variables)

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Database Schema

### `users`

| Column        | Type                | Description              |
| ------------- | ------------------- | ------------------------ |
| id            | BIGSERIAL PK        |                          |
| name          | VARCHAR(100)        |                          |
| email         | VARCHAR(150) UNIQUE |                          |
| password_hash | TEXT                | BCrypt hashed            |
| role          | VARCHAR(20)         | ADMIN / CUSTOMER / AGENT |
| created_at    | TIMESTAMP           | Auto                     |

### `zones`

| Column      | Type                | Description   |
| ----------- | ------------------- | ------------- |
| id          | BIGSERIAL PK        |               |
| zone_name   | VARCHAR(100) UNIQUE | e.g. "Zone A" |
| description | TEXT                | Optional      |

### `rate_cards`

| Column        | Type                                   | Description              |
| ------------- | -------------------------------------- | ------------------------ |
| id            | BIGSERIAL PK                           |                          |
| from_zone_id  | FK → zones                             |                          |
| to_zone_id    | FK → zones                             |                          |
| order_type    | VARCHAR(10)                            | B2B or B2C               |
| rate_per_kg   | DECIMAL(10,2)                          | Base rate per kg         |
| cod_surcharge | DECIMAL(10,2)                          | Added for COD payments   |
| UNIQUE        | (from_zone_id, to_zone_id, order_type) | Prevents duplicate cards |

### `orders`

| Column                         | Type          | Description             |
| ------------------------------ | ------------- | ----------------------- |
| id                             | BIGSERIAL PK  |                         |
| customer_id                    | FK → users    |                         |
| agent_id                       | FK → users    | Nullable                |
| pickup_address                 | TEXT          |                         |
| pickup_zone_id                 | FK → zones    |                         |
| drop_address                   | TEXT          |                         |
| drop_zone_id                   | FK → zones    |                         |
| length_cm, width_cm, height_cm | DECIMAL       | Package dimensions      |
| actual_weight                  | DECIMAL       | In kg                   |
| charged_weight                 | DECIMAL       | max(actual, volumetric) |
| order_type                     | VARCHAR(10)   | B2B / B2C               |
| payment_type                   | VARCHAR(10)   | PREPAID / COD           |
| total_charge                   | DECIMAL(10,2) | Auto-calculated         |
| status                         | VARCHAR(30)   | Order lifecycle status  |
| rescheduled_date               | DATE          | Set on reschedule       |
| created_at                     | TIMESTAMP     | Auto                    |

### `order_tracking_history` _(append-only — never updated or deleted)_

| Column     | Type         | Description                  |
| ---------- | ------------ | ---------------------------- |
| id         | BIGSERIAL PK |                              |
| order_id   | FK → orders  |                              |
| old_status | VARCHAR(30)  | Previous status              |
| new_status | VARCHAR(30)  | New status                   |
| changed_by | FK → users   | Actor (admin/agent/customer) |
| timestamp  | TIMESTAMP    | Auto, `@CreationTimestamp`   |

---

## Rate Calculation Logic

### Step 1 — Volumetric Weight

```
volumetric_weight = (L × B × H) / 5000   [dims in cm → result in kg]
```

### Step 2 — Charged Weight

```
charged_weight = max(actual_weight, volumetric_weight)
```

### Step 3 — Rate Card Lookup

Looks up `rate_cards` table by:

- `from_zone_id` = pickup zone
- `to_zone_id` = drop zone
- `order_type` = B2B or B2C (separate rates for each)

Intra-zone (same pickup & drop zone) and inter-zone each have their own rate cards configured by the Admin. **Nothing is hardcoded.**

### Step 4 — Total Charge

```
base_charge  = charged_weight × rate_card.rate_per_kg
total_charge = base_charge + (payment_type == "COD" ? rate_card.cod_surcharge : 0)
```

The quote is shown to the customer **before** they confirm the order.

---

## Order Status Lifecycle

```
PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                                ↘ FAILED → PENDING (reschedule)
```

Every transition is **immutably logged** in `order_tracking_history` with timestamp and actor.

---

## API Documentation

### Auth (Public)

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| POST   | `/api/auth/register` | Register (role: ADMIN/CUSTOMER/AGENT) |
| POST   | `/api/auth/login`    | Login → JWT                           |

### Customer (`ROLE_CUSTOMER`)

| Method | Endpoint                               | Description                      |
| ------ | -------------------------------------- | -------------------------------- |
| GET    | `/api/customer/zones`                  | Available zones (for dropdowns)  |
| POST   | `/api/customer/quotes`                 | Calculate shipping quote         |
| POST   | `/api/customer/orders`                 | Place new order                  |
| GET    | `/api/customer/orders`                 | My order history                 |
| POST   | `/api/customer/orders/{id}/reschedule` | Reschedule failed order          |
| GET    | `/api/customer/orders/{id}/timeline`   | Full immutable tracking timeline |

### Admin (`ROLE_ADMIN`)

| Method   | Endpoint                                     | Description                        |
| -------- | -------------------------------------------- | ---------------------------------- |
| GET/POST | `/api/admin/zones`                           | Manage zones                       |
| DELETE   | `/api/admin/zones/{id}`                      | Delete zone                        |
| GET/POST | `/api/admin/rate-cards`                      | Manage rate cards                  |
| DELETE   | `/api/admin/rate-cards/{id}`                 | Delete rate card                   |
| GET      | `/api/admin/orders?status=&zoneId=&agentId=` | Filter all orders                  |
| POST     | `/api/admin/orders?customerId=`              | Create order on behalf of customer |
| PUT      | `/api/admin/orders/{id}/override-status`     | Override any order status          |
| POST     | `/api/admin/orders/{id}/auto-assign`         | Trigger auto-assignment            |
| POST     | `/api/admin/orders/{id}/assign?agentId=`     | Manual agent assignment            |

### Agent (`ROLE_AGENT`)

| Method | Endpoint                                   | Description         |
| ------ | ------------------------------------------ | ------------------- |
| GET    | `/api/agent/orders`                        | My assigned orders  |
| PUT    | `/api/agent/orders/{id}/status?newStatus=` | Update order status |
