-- Create wholesale customers table
CREATE TABLE public.wholesale_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  discount_percentage INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wholesale pricing table
CREATE TABLE public.wholesale_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  price_per_unit NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.wholesale_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies for wholesale_customers (admin/staff only)
CREATE POLICY "Staff can view wholesale customers" 
ON public.wholesale_customers 
FOR SELECT 
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can insert wholesale customers" 
ON public.wholesale_customers 
FOR INSERT 
WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can update wholesale customers" 
ON public.wholesale_customers 
FOR UPDATE 
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete wholesale customers" 
ON public.wholesale_customers 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for wholesale_pricing (admin/staff only)
CREATE POLICY "Staff can view wholesale pricing" 
ON public.wholesale_pricing 
FOR SELECT 
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can insert wholesale pricing" 
ON public.wholesale_pricing 
FOR INSERT 
WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Staff can update wholesale pricing" 
ON public.wholesale_pricing 
FOR UPDATE 
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete wholesale pricing" 
ON public.wholesale_pricing 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_wholesale_customers_updated_at
BEFORE UPDATE ON public.wholesale_customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wholesale_pricing_updated_at
BEFORE UPDATE ON public.wholesale_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();