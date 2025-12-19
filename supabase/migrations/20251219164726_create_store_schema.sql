/*
  # Create Platinum Store Database Schema

  1. New Tables
    - `store_settings`
      - `id` (uuid, primary key)
      - `store_name` (text) - Store display name
      - `hero_title` (text) - Main heading text
      - `phone` (text) - WhatsApp contact number
      - `bg_color` (text) - Background color code
      - `bg_image` (text) - Background image URL
      - `logo` (text) - Logo image URL
      - `card_mode` (text) - Display style mode
      - `hero_color` (text) - Hero text color
      - `hero_font` (text) - Hero font family
      - `hero_size` (text) - Hero font size
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `price` (numeric) - Product price
      - `category` (text) - Product category
      - `description` (text) - Product description
      - `image` (text) - Product image URL
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Public read access for storefront
    - Authenticated write access for admin panel
*/

-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text DEFAULT 'Platinum Store' NOT NULL,
  hero_title text DEFAULT 'Premium Quality & Modern Elegance' NOT NULL,
  phone text DEFAULT '213' NOT NULL,
  bg_color text DEFAULT '#0f172a' NOT NULL,
  bg_image text DEFAULT '',
  logo text DEFAULT '',
  card_mode text DEFAULT '3d' NOT NULL,
  hero_color text DEFAULT '#ffffff' NOT NULL,
  hero_font text DEFAULT '''Tajawal'', sans-serif' NOT NULL,
  hero_size text DEFAULT '3.5rem' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  description text DEFAULT '',
  image text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Anyone can view store settings"
  ON store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin write policies (authenticated users can modify)
CREATE POLICY "Authenticated users can update store settings"
  ON store_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Insert default settings
INSERT INTO store_settings (store_name, hero_title, phone)
VALUES ('Platinum Store Pro', 'المتجر البلاتيني المطور - تجربة تسوق استثنائية', '213')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, category, description, image, sort_order) VALUES
('Platinum Timepiece Pro', 15500, 'Luxury', 'Precision and style combined into one masterpiece.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 1),
('Urban Tech Sneakers', 12000, 'Fashion', 'Modern comfort for the urban explorer.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 2),
('Pro Lens Camera', 85000, 'Electronics', 'Capture every detail with professional precision.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 3)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_store_settings_updated_at') THEN
    CREATE TRIGGER update_store_settings_updated_at
      BEFORE UPDATE ON store_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;