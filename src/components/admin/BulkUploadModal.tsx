import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkUploadModal = ({ isOpen, onClose, onSuccess }: BulkUploadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const product: any = {};
      headers.forEach((header, idx) => {
        product[header] = values[idx];
      });

      // Validate required fields
      if (!product.name || !product.brand || !product.category || !product.price) {
        parseErrors.push(`Row ${i + 1}: Missing required fields (name, brand, category, price)`);
        continue;
      }

      products.push({
        name: product.name,
        description: product.description || null,
        brand: product.brand,
        category: product.category,
        price: parseFloat(product.price),
        original_price: product.original_price ? parseFloat(product.original_price) : null,
        stock_count: parseInt(product.stock_count || '0'),
        images: product.images ? product.images.split('|').map((i: string) => i.trim()) : [],
      });
    }

    return { products, errors: parseErrors };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const { products, errors } = parseCSV(text);
      setPreview(products);
      setErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      toast.error('No valid products to upload');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('products').insert(preview);

    if (error) {
      toast.error('Failed to upload products');
    } else {
      toast.success(`Successfully uploaded ${preview.length} products`);
      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal-dark/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-elevated"
        >
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
            <h2 className="text-lg font-semibold">Bulk Upload Products</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <h3 className="font-medium mb-2">CSV Format</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Upload a CSV file with the following columns:
              </p>
              <code className="text-xs bg-charcoal-light px-2 py-1 rounded block overflow-x-auto">
                name,description,brand,category,price,original_price,stock_count,images
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                For multiple images, separate URLs with | (pipe character)
              </p>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Drop your CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Maximum 50 products per upload</p>
              </label>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Errors Found</span>
                </div>
                <ul className="text-sm space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-emerald-500 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{preview.length} products ready to upload</span>
                </div>
                <div className="max-h-48 overflow-y-auto bg-secondary/30 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-secondary">
                      <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Brand</th>
                        <th className="text-left p-2">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((product, i) => (
                        <tr key={i} className="border-t border-border/50">
                          <td className="p-2 truncate max-w-[200px]">{product.name}</td>
                          <td className="p-2">{product.brand}</td>
                          <td className="p-2">${product.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p className="p-2 text-center text-muted-foreground text-sm">
                      ... and {preview.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={loading || preview.length === 0}
                className="flex-1 btn-luxury"
              >
                {loading ? 'Uploading...' : `Upload ${preview.length} Products`}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
