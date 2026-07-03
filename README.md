# Last-Mile Delivery Tracker

A full-stack delivery management platform with role-based access control, dynamic rate calculation, intelligent agent auto-assignment, and real-time order tracking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security (JWT), Hibernate/JPA |
| Database | PostgreSQL (Neon Cloud) |
| Frontend | Next.js 16, React 19, Axios, Vanilla CSS |
| Notifications | JavaMailSender + Mailtrap SMTP |

---

## Project Structure

```
LastMile_delivery/
├── backend/          # Spring Boot REST API
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
Then update `application.yml` datasource to `jdbc:postgresql://localhost:5432/lastmile`.

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
# backend/src/main/resources/application.yml

spring:
  datasource:
    url: jdbc:postgresql://<HOST>/<DBNAME>?sslmode=require
    username: <DB_USER>
    password: <DB_PASSWORD>
  mail:
    host: sandbox.smtp.mailtrap.io
    port: 2525
    username: <MAILTRAP_USERNAME>
    password: <MAILTRAP_PASSWORD>

jwt:
  secret: <64-char-hex-secret>
  expirationMs: 86400000
```

---

## Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password_hash | TEXT | BCrypt hashed |
| role | VARCHAR(20) | ADMIN / CUSTOMER / AGENT |
| created_at | TIMESTAMP | Auto |

### `zones`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| zone_name | VARCHAR(100) UNIQUE | e.g. "Zone A" |
| description | TEXT | Optional |

### `rate_cards`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| from_zone_id | FK → zones | |
| to_zone_id | FK → zones | |
| order_type | VARCHAR(10) | B2B or B2C |
| rate_per_kg | DECIMAL(10,2) | Base rate |
| cod_surcharge | DECIMAL(10,2) | Added for COD payments |
| UNIQUE | (from_zone_id, to_zone_id, order_type) | |

### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| customer_id | FK → users | |
| agent_id | FK → users | Nullable |
| pickup_address | TEXT | |
| pickup_zone_id | FK → zones | |
| drop_address | TEXT | |
| drop_zone_id | FK → zones | |
| length_cm, width_cm, height_cm | DECIMAL | Package dimensions |
| actual_weight | DECIMAL | In kg |
| charged_weight | DECIMAL | max(actual, volumetric) |
| order_type | VARCHAR(10) | B2B / B2C |
| payment_type | VARCHAR(10) | PREPAID / COD |
| total_charge | DECIMAL(10,2) | Auto-calculated |
| status | VARCHAR(30) | Enum: see lifecycle below |
| rescheduled_date | DATE | Set on reschedule |
| created_at | TIMESTAMP | Auto |

### `order_tracking_history` *(immutable)*
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| order_id | FK → orders | |
| old_status | VARCHAR(30) | Previous status |
| new_status | VARCHAR(30) | New status |
| changed_by | FK → users | Actor |
| timestamp | TIMESTAMP | Auto, immutable |

---

## Rate Calculation Logic

### Step 1 — Volumetric Weight
```
volumetric_weight = (L × B × H) / 5000   [all dims in cm, result in kg]
```

### Step 2 — Charged Weight
```
charged_weight = max(actual_weight, volumetric_weight)
```

### Step 3 — Zone Rate Lookup
The system looks up the `rate_cards` table using:
- `from_zone_id` = pickup zone
- `to_zone_id` = drop zone  
- `order_type` = B2B or B2C

Intra-zone (same pickup & drop zone) and inter-zone both have separate rate cards configured by the Admin.

### Step 4 — Base Charge
```
base_charge = charged_weight × rate_card.rate_per_kg
```

### Step 5 — COD Surcharge
```
if payment_type == "COD":
    total_charge = base_charge + rate_card.cod_surcharge
else:
    total_charge = base_charge
```

The charge is shown to the customer **before** they confirm the order.

---

## Order Status Lifecycle

```
PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                                 ↘ FAILED → PENDING (rescheduled)
```

Every transition is **immutably logged** in `order_tracking_history` with timestamp and actor.

---

## API Documentation

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user (role: ADMIN/CUSTOMER/AGENT) | Public |
| POST | `/api/auth/login` | Login → JWT token | Public |

### Customer (`ROLE_CUSTOMER`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/orders` | My orders |
| GET | `/api/customer/zones` | Available zones (for dropdown) |
| POST | `/api/customer/quotes` | Calculate shipping quote |
| POST | `/api/customer/orders` | Place new order |
| POST | `/api/customer/orders/{id}/reschedule` | Reschedule failed order |
| GET | `/api/customer/orders/{id}/timeline` | Full tracking timeline |

### Admin (`ROLE_ADMIN`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/zones` | Manage zones |
| DELETE | `/api/admin/zones/{id}` | Delete zone |
| GET/POST | `/api/admin/rate-cards` | Manage rate cards |
| DELETE | `/api/admin/rate-cards/{id}` | Delete rate card |
| GET | `/api/admin/orders?status=&zoneId=&agentId=` | Filter all orders |
| POST | `/api/admin/orders?customerId=` | Create order for customer |
| PUT | `/api/admin/orders/{id}/override-status` | Override any order status |
| POST | `/api/admin/orders/{id}/auto-assign` | Trigger auto-assignment |
| POST | `/api/admin/orders/{id}/assign?agentId=` | Manual agent assignment |

### Agent (`ROLE_AGENT`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/orders` | My assigned orders |
| PUT | `/api/agent/orders/{id}/status?newStatus=` | Update order status |

---

## User Roles & Default Credentials (for testing)

Register via `/register` or `POST /api/auth/register`:
```json
{ "name": "Admin", "email": "admin@test.com", "password": "password", "role": "ADMIN" }
{ "name": "Customer", "email": "customer@test.com", "password": "password", "role": "CUSTOMER" }
{ "name": "Agent", "email": "agent@test.com", "password": "password", "role": "AGENT" }
```

After login, JWT is stored in `localStorage` and sent automatically on every API request.
