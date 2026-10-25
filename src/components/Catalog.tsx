import { useEffect, useState, useMemo } from 'react';
import { Package, Search, Euro, ImageIcon, ArrowLeft, Star, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';

import { navigate } from '@/lib/navigate';

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
  sort_order: number;
  image_count?: number;
};

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (err) {
      setError('No se pudieron cargar los productos. Inténtalo más tarde.');
    } else {
      const prods = (data || []) as Product[];
      // Fetch image counts
      const ids = prods.map((p) => p.id);
      if (ids.length > 0) {
        const { data: imgs } = await supabase
          .from('product_images')
          .select('product_id')
          .in('product_id', ids);
        const counts = new Map<string, number>();
        (imgs || []).forEach((i: { product_id: string }) => {
          counts.set(i.product_id, (counts.get(i.product_id) || 0) + 1);
        });
        prods.forEach((p) => { p.image_count = counts.get(p.id) || (p.image_url ? 1 : 0); });
      }
      setProducts(prods);
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['Todas', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div className="min-h-screen bg-ink-50">
      <Header />

      <main className="pt-20 lg:pt-24">
        {/* Hero section */}
        <section className="bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold">Catálogo de productos</h1>
            </div>
            <p className="text-white/70 text-base lg:text-lg max-w-2xl">
              Explora nuestra selección de equipos y accesorios de climatización. Precios orientativos
              con instalación incluida. Contacta con nosotros para un presupuesto personalizado.
            </p>
          </div>
        </section>

        {/* Catalog content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          {/* Search + filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-white text-ink-600 border border-ink-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
              <p className="text-ink-400 text-sm">Cargando productos...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-ink-500 text-sm max-w-md">{error}</p>
              <button
                onClick={loadProducts}
                className="mt-4 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package className="w-12 h-12 text-ink-300 mb-4" />
              <p className="text-ink-500 text-sm">
                {products.length === 0
                  ? 'Todavía no hay productos en el catálogo. Vuelve pronto.'
                  : 'No se encontraron productos con esos criterios.'}
              </p>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product) => (
                <article
                  key={product.id}
                  className="group bg-white rounded-2xl border border-ink-100 shadow-sm hover:shadow-xl hover:shadow-ink-900/5 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-ink-100 cursor-pointer" onClick={() => navigate(`/productos/${product.id}`)}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-ink-300" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-warning-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Star className="w-3 h-3 fill-white" /> Destacado
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur text-ink-700 text-xs font-medium rounded-full shadow-sm">
                      {product.category}
                    </span>
                    {(product.image_count || 0) > 1 && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-ink-900/70 backdrop-blur text-white text-xs font-medium rounded-full shadow-sm">
                        {product.image_count} fotos
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-display font-semibold text-ink-900 text-base mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => navigate(`/productos/${product.id}`)}>
                      {product.name}
                    </h3>
                    <p className="text-ink-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1" dangerouslySetInnerHTML={{ __html: product.description }} />
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-100">
                      <div className="flex items-baseline gap-1">
                        <Euro className="w-4 h-4 text-primary-600" />
                        <span className="font-display font-bold text-xl text-ink-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {product.tech_sheet_url && (
                          <a
                            href={product.tech_sheet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Descargar ficha técnica en PDF"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-primary-500/20 hover:bg-primary-700 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Ficha PDF
                          </a>
                        )}
                        <button
                          onClick={() => navigate(`/productos/${product.id}`)}
                          className="px-3.5 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          Ver detalles
                        </button>
                        <button
                          onClick={() => {
                            navigate('/');
                            window.setTimeout(() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }), 0);
                          }}
                          className="px-3.5 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          Consultar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
