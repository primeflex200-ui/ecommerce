-- =====================================================
-- SUPABASE PRODUCTS TABLE MIGRATION
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to update
-- the products table with all required columns
-- =====================================================

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS unit_quantity NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS display_unit TEXT,
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Update existing products to set in_stock based on stock quantity
UPDATE products 
SET in_stock = (stock > 0)
WHERE in_stock IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;
