CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    google_id TEXT UNIQUE,
    picture TEXT,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table linked to Supabase auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit TEXT,
    unit_quantity NUMERIC(10,2),
    display_unit TEXT,
    vendor_id UUID REFERENCES vendors(id),
    image_url TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_email TEXT,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

INSERT INTO categories (name) VALUES
('Fruits & Vegetables'),
('Daily Staples'),
('Snacks & More'),
('Bakery & Dairy'),
('Home Food'),
('Special Categories'),
('Conscious Living');
