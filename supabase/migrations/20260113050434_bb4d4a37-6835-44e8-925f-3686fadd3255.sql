-- Create site_settings table for storing configurable content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only staff can modify settings
CREATE POLICY "Staff can update settings" 
ON public.site_settings 
FOR UPDATE 
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can insert settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete settings" 
ON public.site_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default wholesale settings
INSERT INTO public.site_settings (key, value) VALUES (
  'wholesale_page',
  '{
    "hero_title": "Wholesale Partnership",
    "hero_subtitle": "Join our wholesale program and unlock exclusive pricing, priority access to new products, and dedicated business support for your retail store or distribution business.",
    "benefits": [
      {"icon": "Percent", "title": "Exclusive Discounts", "description": "Get up to 30% off on bulk orders with tiered pricing based on volume."},
      {"icon": "Package", "title": "Priority Stock Access", "description": "First access to new arrivals and limited edition products."},
      {"icon": "Truck", "title": "Free Shipping", "description": "Complimentary shipping on all wholesale orders over Rs. 50,000."},
      {"icon": "Store", "title": "Dedicated Support", "description": "Personal account manager for all your business needs."}
    ],
    "form_title": "Apply for Wholesale Account",
    "form_subtitle": "Fill out the form below and our team will review your application within 2-3 business days."
  }'::jsonb
);