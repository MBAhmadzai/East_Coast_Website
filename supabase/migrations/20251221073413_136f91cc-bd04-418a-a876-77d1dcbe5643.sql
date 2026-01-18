-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  flash_sale_active BOOLEAN DEFAULT false,
  flash_sale_discount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create order_items table for permanent purchase records
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_sale DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create media_library table for admin uploads
CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add brand_id and category_id to products (keeping text columns for backward compatibility)
ALTER TABLE public.products 
  ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- Brands policies (public read, admin/staff write)
CREATE POLICY "Brands are viewable by everyone"
ON public.brands FOR SELECT
USING (true);

CREATE POLICY "Admins can insert brands"
ON public.brands FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
ON public.brands FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
ON public.brands FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Products policies (add admin write access)
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
  OR public.is_admin_or_staff(auth.uid())
);

CREATE POLICY "Staff can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (public.is_admin_or_staff(auth.uid()) OR auth.uid() IS NOT NULL);

-- Orders policies (add admin/staff access)
CREATE POLICY "Staff can view all orders"
ON public.orders FOR SELECT
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE
USING (public.is_admin_or_staff(auth.uid()));

-- User roles policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Media library policies
CREATE POLICY "Admins can view all media"
ON public.media_library FOR SELECT
USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can upload media"
ON public.media_library FOR INSERT
WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete media"
ON public.media_library FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp triggers for new tables
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default brands
INSERT INTO public.brands (name, slug, is_featured) VALUES
  ('Maxwell', 'maxwell', true),
  ('Choetech', 'choetech', true),
  ('BoAt', 'boat', true),
  ('Catmobile', 'catmobile', false),
  ('Intex', 'intex', false);

-- Insert default categories
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Smartwatches', 'smartwatches', 'Watch'),
  ('Audio', 'audio', 'Headphones'),
  ('Power', 'power', 'Zap'),
  ('Protection', 'protection', 'Shield');

-- Update products with brand_id references
UPDATE public.products p SET brand_id = b.id FROM public.brands b WHERE LOWER(p.brand) = LOWER(b.name);

-- Update products with category_id references
UPDATE public.products p SET category_id = c.id FROM public.categories c WHERE LOWER(p.category) = LOWER(c.name);