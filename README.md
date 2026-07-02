# Last-Mile Delivery Tracker

A comprehensive delivery management platform tailored for Admins, Customers, and Agents. The system features a custom dynamic rate calculation engine based on volumetric weight, intelligent auto-assignment logic, and an immutable audit ledger for state tracking.

## Architecture & Tech Stack

- **Backend**: Java / Spring Boot 3 / Spring Security (JWT)
- **Database**: PostgreSQL (DDL schemas for strict tracking ledgers)
- **Frontend**: Next.js / React (Custom Vanilla CSS styling)
- **Notification**: Mock Logger (extendable for SMTP in the future)

## Project Structure

- `/database`: Contains the `schema.sql` and `docker-compose.yml` to set up the PostgreSQL database.
- `/backend`: The Spring Boot application.
- `/frontend`: The Next.js web application.

## Local Setup Instructions

### 1. Database
You can spin up a local PostgreSQL database using Docker:
```bash
cd database
docker-compose up -d
```
The database will be available on `localhost:5432`. Ensure the tables are created by running the `schema.sql` script against the newly created database (e.g., using pgAdmin, DataGrip, or `psql`).

### 2. Backend (Spring Boot)
Requires Java 17 and Maven.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your `application.yml` inside `src/main/resources/` with the correct DB credentials (default is usually `postgres` / `postgres`).
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
The backend will run on `http://localhost:8080`.

### 3. Frontend (Next.js)
Requires Node.js 18+.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
The frontend will be accessible at `http://localhost:3000`.

## API Documentation
Once the backend is running, the core API endpoints include:
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/orders` - View orders (filtered by role)
- `POST /api/orders` - Create a new order (Customer)
- `PUT /api/orders/{id}/status` - Update order status (Agent/Admin)
- `GET /api/rates/quote` - Get an upfront quote for an order (Customer)
