-- Create storage buckets for product images and media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('media-library', 'media-library', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);

-- RLS policies for product-images bucket
-- Anyone can view product images (public bucket)
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only staff and admin can upload product images
CREATE POLICY "Staff and admin can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Only staff and admin can update product images
CREATE POLICY "Staff and admin can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Only staff and admin can delete product images
CREATE POLICY "Staff and admin can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- RLS policies for media-library bucket
-- Anyone can view media library files (public bucket)
CREATE POLICY "Media library files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-library');

-- Only staff and admin can upload to media library
CREATE POLICY "Staff and admin can upload to media library"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-library' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Only staff and admin can update media library files
CREATE POLICY "Staff and admin can update media library files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media-library' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);

-- Only staff and admin can delete media library files
CREATE POLICY "Staff and admin can delete media library files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-library' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'staff')
  )
);