import { useEffect, useState, useRef, useCallback } from 'react';
import { Package, ArrowLeft, Star, Euro, ImageIcon, Download, MessageCircle, ChevronLeft, ChevronRight, ZoomIn, Send, CheckCircle2, AlertCircle, Loader2, Phone, Mail, Tag, FileText, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';
import { Header } from '@/components/Header';
import { navigate } from '@/lib/navigate';
import { useSeo } from '@/hooks/useSeo';

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
};

type Product = {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  tech_sheet_url: string | null;
  featured: boolean;
  is_active: boolean;
};

export function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', city: '', message: '' });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  const plainDescription = product
    ? product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  useSeo({
    disabled: !product,
    title: product ? `${product.name} | Climatizaciones Montaño, S.L.` : undefined,
    description: product
      ? plainDescription.slice(0, 160) || `Producto de climatización: ${product.name}.`
      : undefined,
    canonicalPath: product?.slug ? `/productos/${product.slug}` : undefined,
    ogImage: product?.image_url || undefined,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Acepta tanto el slug amigable (/productos/split-panasonic-...) como el
      // UUID antiguo, para no romper enlaces ya compartidos o indexados.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const query = supabase.from('products').select('*').eq('is_active', true);
      const { data, error: err } = await (isUuid ? query.eq('id', slug) : query.eq('slug', slug)).maybeSingle();
      if (err || !data) {
        setError('Producto no encontrado.');
        setLoading(false);
        return;
      }
      // Si se ha entrado con el UUID antiguo, se deja en la barra la URL amigable.
      if (isUuid && data.slug && typeof window !== 'undefined') {
        const canonical = `/productos/${data.slug}`;
        if (window.location.pathname !== canonical) {
          window.history.replaceState(null, '', canonical);
        }
      }
      const productId = data.id as string;
      setProduct(data as Product);
      setActiveImage(data.image_url);
      const { data: imgs } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      const list = (imgs as ProductImage[]) || [];
      if (list.length === 0 && data.image_url) {
        list.push({ id: 'primary', product_id: productId, image_url: data.image_url, sort_order: 0 });
      }
      setImages(list);
      if (!data.image_url && list.length > 0) setActiveImage(list[0].image_url);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    setZooming(false);
  }, [activeImage]);

  const activeIndex = images.findIndex((i) => i.image_url === activeImage);
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < images.length - 1;

  const goPrev = () => { if (hasPrev) setActiveImage(images[activeIndex - 1].image_url); };
  const goNext = () => { if (hasNext) setActiveImage(images[activeIndex + 1].image_url); };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!contactForm.name.trim()) next.name = 'Introduce tu nombre';
    if (!contactForm.email.trim()) next.email = 'Introduce tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) next.email = 'Email no válido';
    if (!contactForm.phone.trim()) next.phone = 'Introduce tu teléfono';
    if (!contactForm.city.trim()) next.city = 'Introduce tu ciudad';
    setContactErrors(next);
    if (Object.keys(next).length > 0) return;

    setContactStatus('loading');
    const { error } = await supabase.from('contact_requests').insert({
      name: contactForm.name.trim(),
      email: contactForm.email.trim().toLowerCase(),
      phone: contactForm.phone.trim(),
      city: contactForm.city.trim() || null,
      service_type: 'instalacion',
      installation_type: null,
      message: `[Producto: ${product?.name}] ${contactForm.message.trim()}`.trim() || null,
    });
    if (error) {
      setContactStatus('error');
      return;
    }
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name.trim(),
          email: contactForm.email.trim().toLowerCase(),
          phone: contactForm.phone.trim(),
          city: contactForm.city.trim(),
          service_type: 'instalacion',
          installation_type: null,
          message: `[Producto: ${product?.name}] ${contactForm.message.trim()}`,
        }),
      });
    } catch {
      // best-effort
    }
    setContactStatus('success');
    setContactForm({ name: '', email: '', phone: '', city: '', message: '' });
  };

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
          <Package className="w-16 h-16 text-ink-300 mb-4" />
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-ink-500">
          <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Inicio</button>
          <span>/</span>
          <button onClick={() => navigate('/catalogo')} className="hover:text-primary-600 transition-colors">Catálogo</button>
          <span>/</span>
          <span className="text-ink-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Product main */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery column */}
          <div>
            <div
              ref={imgContainerRef}
              className="relative aspect-square bg-white rounded-2xl border border-ink-100 overflow-hidden mb-4 flex items-center justify-center cursor-zoom-in shadow-sm"
              onMouseEnter={() => setZooming(true)}
              onMouseLeave={() => setZooming(false)}
              onMouseMove={handleMouseMove}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-200 ease-out select-none"
                  style={{
                    transform: zooming ? 'scale(2.2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                  draggable={false}
                />
              ) : (
                <ImageIcon className="w-20 h-20 text-ink-300" />
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    disabled={!hasPrev}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all ${hasPrev ? 'text-ink-700 hover:bg-white hover:scale-105' : 'text-ink-300 cursor-not-allowed opacity-50'}`}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!hasNext}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all ${hasNext ? 'text-ink-700 hover:bg-white hover:scale-105' : 'text-ink-300 cursor-not-allowed opacity-50'}`}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {activeImage && (
                <span className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-ink-900/60 backdrop-blur text-white text-xs font-medium rounded-md flex items-center gap-1.5 pointer-events-none">
                  <ZoomIn className="w-3.5 h-3.5" /> Pasa el ratón para ampliar
                </span>
              )}

              {images.length > 1 && (
                <span className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-ink-900/60 backdrop-blur text-white text-xs font-medium rounded-md pointer-events-none">
                  {activeIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeImage === img.image_url ? 'border-primary-600 ring-2 ring-primary-200' : 'border-ink-200 hover:border-primary-300'}`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`h-2 rounded-full transition-all ${activeIndex === idx ? 'bg-primary-600 w-6' : 'bg-ink-300 hover:bg-ink-400 w-2'}`}
                      aria-label={`Ir a imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info column */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink-100 text-ink-700 text-xs font-medium rounded-full">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-warning-100 text-warning-700 text-xs font-semibold rounded-full">
                  <Star className="w-3 h-3 fill-warning-500" /> Destacado
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl lg:text-4xl font-bold text-ink-900 mb-4 leading-tight">{product.name}</h1>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 mb-6">
              <h2 className="font-display text-xl font-bold text-ink-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" /> Descripción del producto
              </h2>
              <div className="rich-content text-ink-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <Euro className="w-6 h-6 text-primary-600" />
              <span className="font-display font-bold text-4xl text-ink-900">{formatPrice(product.price)}</span>
            </div>

            {/* Guarantee badge */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="font-display font-bold text-success-800 text-base">3 años de garantía total</p>
                <p className="text-success-700 text-xs">Garantía completa en equipos e instalación. Tranquilidad asegurada.</p>
              </div>
            </div>

            <div className="mb-6">
              {product.tech_sheet_url && (
                <a
                  href={product.tech_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-5 py-4 text-white shadow-lg shadow-primary-600/30 ring-1 ring-primary-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:translate-y-0"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                    <FileText className="h-6 w-6" />
                  </span>
                  <span className="flex flex-col text-left leading-tight">
                    <span className="font-display text-base font-bold sm:text-lg">Descargar ficha técnica</span>
                    <span className="mt-0.5 text-xs font-medium text-primary-100 sm:text-[13px]">
                      Especificaciones completas del producto
                    </span>
                  </span>
                  <span className="ml-auto flex flex-shrink-0 items-center gap-2">
                    <span className="hidden rounded-md bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/25 sm:inline">
                      PDF
                    </span>
                    <Download className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-0.5" />
                  </span>
                </a>
              )}

              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href="tel:+34676628348"
                  className="inline-flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-700"
                >
                  <Phone className="h-4 w-4" /> Llamar ahora
                </a>
                <a
                  href="https://wa.me/34691680706"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl bg-success-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-success-500/20 transition-colors hover:bg-success-700"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a
                  href="mailto:info@climont.es?subject=Consulta%20sobre%20un%20producto"
                  className="inline-flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-primary-400 hover:text-primary-600"
                >
                  <Mail className="h-4 w-4" /> Email
                </a>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-ink-100 text-xs text-ink-400">
              Precios orientativos con instalación incluida. Contacta con nosotros para un presupuesto personalizado y sin compromiso.
            </div>
          </div>
        </div>

        {/* Contact form */}
        <section className="mt-12 bg-white rounded-2xl border border-ink-100 shadow-sm p-6 sm:p-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Solicita información sobre este producto</h2>
            <p className="text-ink-500 text-sm mb-6">Rellena el formulario y nos pondremos en contacto contigo para un presupuesto personalizado.</p>

            {contactStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-success-500 mb-3" />
                <p className="text-ink-700 font-medium">¡Mensaje enviado!</p>
                <p className="text-ink-500 text-sm mt-1">Te responderemos lo antes posible.</p>
                <button
                  onClick={() => setContactStatus('idle')}
                  className="mt-4 text-primary-600 text-sm font-medium hover:underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${contactErrors.name ? 'border-error-500' : 'border-ink-200'}`}
                    />
                    {contactErrors.name && <p className="text-error-600 text-xs mt-1">{contactErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${contactErrors.email ? 'border-error-500' : 'border-ink-200'}`}
                    />
                    {contactErrors.email && <p className="text-error-600 text-xs mt-1">{contactErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Teléfono *</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${contactErrors.phone ? 'border-error-500' : 'border-ink-200'}`}
                    />
                    {contactErrors.phone && <p className="text-error-600 text-xs mt-1">{contactErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 ${contactErrors.city ? 'border-error-500' : 'border-ink-200'}`}
                    />
                    {contactErrors.city && <p className="text-error-600 text-xs mt-1">{contactErrors.city}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Mensaje</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={3}
                    placeholder="Cuéntanos qué necesitas..."
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                {contactStatus === 'error' && (
                  <div className="flex items-center gap-2 text-error-600 text-sm">
                    <AlertCircle className="w-4 h-4" /> Error al enviar. Inténtalo de nuevo.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={contactStatus === 'loading'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
                >
                  {contactStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {contactStatus === 'loading' ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}