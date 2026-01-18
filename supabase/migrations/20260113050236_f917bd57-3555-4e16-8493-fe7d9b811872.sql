-- Allow anyone to submit wholesale applications (insert only)
CREATE POLICY "Anyone can submit wholesale applications" 
ON public.wholesale_customers 
FOR INSERT 
WITH CHECK (true);