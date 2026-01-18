import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Trash2, Copy, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AdminMedia = () => {
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: media, isLoading } = useQuery({
    queryKey: ['media-library', search],
    queryFn: async () => {
      let query = supabase.from('media_library').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.ilike('file_name', `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, fileName }: { id: string; fileName: string }) => {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('media-library')
        .remove([fileName]);
      if (storageError) console.error('Storage delete error:', storageError);
      
      // Then delete from database
      const { error } = await supabase.from('media_library').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast.success('Image deleted');
    },
    onError: () => {
      toast.error('Failed to delete image');
    }
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('media-library')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-library')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from('media_library').insert({
        file_name: fileName,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <AdminLayout title="Media Library">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <input
              type="file"
              id="media-upload"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
            <Button asChild disabled={uploading}>
              <label htmlFor="media-upload" className="cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary animate-pulse rounded-lg" />
            ))}
          </div>
        ) : media && media.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="group relative overflow-hidden">
                <CardContent className="p-0">
                  <div 
                    className="aspect-square cursor-pointer"
                    onClick={() => setSelectedImage(item.file_url)}
                  >
                    <img
                      src={item.file_url}
                      alt={item.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-charcoal-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => copyToClipboard(item.file_url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate({ id: item.id, fileName: item.file_name })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal-dark/90 to-transparent p-2">
                    <p className="text-xs text-white truncate">{item.file_name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No media found</h3>
              <p className="text-muted-foreground mb-4">Upload images to get started</p>
              <Button asChild>
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Image
                </label>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img src={selectedImage} alt="Preview" className="w-full rounded-lg" />
              <div className="mt-4 flex gap-2">
                <Button onClick={() => copyToClipboard(selectedImage)} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMedia;
