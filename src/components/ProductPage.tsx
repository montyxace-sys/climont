import { useEffect, useState } from 'react';
import { Package, ArrowLeft, Star, Euro, ImageIcon, Download, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { navigate } from '@/lib/navigate';

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  tech_sheet_url: string | null;
  featured: boolean;
  is_active: boolean;
};

export function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      if (err || !data) {
        setError('Producto no encontrado.');
        setLoading(false);
        return;
      }
      setProduct(data as Product);
      setActiveImage(data.image_url);
      const { data: imgs } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      const list = (imgs as ProductImage[]) || [];
      // Seed with primary image if no gallery
      if (list.length === 0 && data.image_url) {
        list.push({ id: 'primary', product_id: id, image_url: data.image_url, sort_order: 0 });
      }
      setImages(list);
      if (!activeImage && list.length > 0) setActiveImage(list[0].image_url);
      setLoading(false);
    })();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <Package className="w-12 h-12 text-ink-300 mb-4" />
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Producto no encontrado</h1>
          <p className="text-ink-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/catalogo')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <Header />
      <main className="pt-20 lg:pt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('/catalogo')} className="flex items-center gap-2 text-ink-500 hover:text-primary-600 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="aspect-[4/3] bg-white rounded-2xl border border-ink-100 overflow-hidden mb-3 flex items-center justify-center">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-16 h-16 text-ink-300" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === img.image_url ? 'border-primary-600' : 'border-ink-200 hover:border-primary-300'}`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-ink-100 text-ink-700 text-xs font-medium rounded-full">{product.category}</span>
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 text-xs font-semibold rounded-full">
                  <Star className="w-3 h-3 fill-warning-500" /> Destacado
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold text-ink-900 mb-4">{product.name}</h1>
            <div className="text-ink-600 leading-relaxed mb-6 rich-content" dangerouslySetInnerHTML={{ __html: product.description }} />

            <div className="flex items-baseline gap-2 mb-6">
              <Euro className="w-5 h-5 text-primary-600" />
              <span className="font-display font-bold text-3xl text-ink-900">{formatPrice(product.price)}</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {product.tech_sheet_url && (
                <a
                  href={product.tech_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" /> Descargar ficha técnica
                </a>
              )}
              <button
                onClick={() => {
                  navigate('/');
                  window.setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 0);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
              >
                <MessageCircle className="w-4 h-4" /> Consultar / Presupuesto
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-ink-100 text-xs text-ink-400">
              Precios orientativos con instalación incluida. Contacta con nosotros para un presupuesto personalizado.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
