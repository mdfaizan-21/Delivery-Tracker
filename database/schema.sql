-- Role Enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER', 'AGENT');
-- Order Status Enum
CREATE TYPE order_status AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zones Table
CREATE TABLE zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Rate Cards Table
CREATE TABLE rate_cards (
    id SERIAL PRIMARY KEY,
    from_zone_id INT REFERENCES zones(id),
    to_zone_id INT REFERENCES zones(id),
    order_type VARCHAR(10) CHECK (order_type IN ('B2B', 'B2C')),
    rate_per_kg NUMERIC(10, 2) NOT NULL,
    cod_surcharge NUMERIC(10, 2) DEFAULT 0.00,
    UNIQUE(from_zone_id, to_zone_id, order_type)
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id),
    agent_id INT REFERENCES users(id) NULL,
    pickup_address TEXT NOT NULL,
    pickup_zone_id INT REFERENCES zones(id),
    drop_address TEXT NOT NULL,
    drop_zone_id INT REFERENCES zones(id),
    length_cm NUMERIC(10,2),
    width_cm NUMERIC(10,2),
    height_cm NUMERIC(10,2),
    actual_weight NUMERIC(10,2),
    charged_weight NUMERIC(10,2),
    order_type VARCHAR(10),
    payment_type VARCHAR(10),
    total_charge NUMERIC(10,2),
    status order_status DEFAULT 'PENDING',
    rescheduled_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Order Tracking History
CREATE TABLE order_tracking_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    old_status order_status,
    new_status order_status NOT NULL,
    changed_by INT REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
