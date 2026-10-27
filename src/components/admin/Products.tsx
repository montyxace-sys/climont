import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Star, Eye, EyeOff, Euro, Save, Package, Upload, ImageIcon, Loader2, FileText, ArrowRight, Phone, MessageCircle, Mail, ShieldCheck, Link2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { supabase } from '@/lib/supabase';
import { slugify, uniqueSlug, SLUG_PATTERN } from '@/lib/slug';

type Product = {
  id: string;
  name: string;
  slug?: string | null;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  tech_sheet_url: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  tech_sheet_url: string;
  featured: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: ProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  category: 'General',
  image_url: '',
  tech_sheet_url: '',
  featured: false,
  is_active: true,
  sort_order: '0',
};

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'card' | 'page'>('card');
  const [slugTouched, setSlugTouched] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (err) {
      setError('No se pudieron cargar los productos.');
    } else {
      setProducts(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openNewForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSlugTouched(false);
    setShowForm(true);
    setImageFile(null);
    setImagePreview(null);
    setPdfFile(null);
    setPdfName(null);
    setProductImages([]);
  };

  const openEditForm = (p: Product) => {
    setForm({
      name: p.name,
      slug: p.slug || '',
      description: p.description,
      price: String(p.price),
      category: p.category,
      image_url: p.image_url || '',
      tech_sheet_url: p.tech_sheet_url || '',
      featured: p.featured,
      is_active: p.is_active,
      sort_order: String(p.sort_order),
    });
    setEditingId(p.id);
    setSlugTouched(!!p.slug);
    setShowForm(true);
    setImageFile(null);
    setImagePreview(p.image_url || null);
    setPdfFile(null);
    setPdfName(p.tech_sheet_url ? 'Ficha técnica actual' : null);
    setProductImages([]);
    // Load additional images
    loadProductImages(p.id);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSlugTouched(false);
    setForm(EMPTY_FORM);
    setError(null);
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setPdfFile(null);
    setPdfName(null);
    setProductImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      return;
    }
    setError(null);
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear manual URL since we'll use uploaded file
    setForm((prev) => ({ ...prev, image_url: '' }));
    // Reset input value to allow re-selecting same file
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image_url: '' }));
  };
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('El PDF no debe superar los 20 MB.');
      return;
    }
    setError(null);
    setPdfFile(file);
    setPdfName(file.name);
    setForm((prev) => ({ ...prev, tech_sheet_url: '' }));
    e.target.value = '';
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfName(null);
    setForm((prev) => ({ ...prev, tech_sheet_url: '' }));
  };

  const loadProductImages = async (productId: string) => {
    const { data, error: err } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (err) return;
    let imgs = (data as ProductImage[]) || [];
    // Seed gallery with primary image_url if empty
    if (imgs.length === 0) {
      const { data: prod } = await supabase.from('products').select('image_url').eq('id', productId).single();
      if (prod?.image_url) {
        const { data: inserted } = await supabase
          .from('product_images')
          .insert({ product_id: productId, image_url: prod.image_url, sort_order: 0 })
          .select()
          .single();
        if (inserted) imgs = [inserted as ProductImage];
      }
    }
    setProductImages(imgs);
  };

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (valid.length === 0) {
      setError('Selecciona imágenes válidas (JPG, PNG, WEBP, máx 5 MB).');
      return;
    }
    if (!editingId) {
      setError('Guarda el producto primero para poder añadir imágenes.');
      e.target.value = '';
      return;
    }
    setError(null);
    setUploadingImages(true);
    try {
      for (const file of valid) {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(filePath);
        const nextOrder = productImages.length + 1;
        const { data: inserted, error: insErr } = await supabase
          .from('product_images')
          .insert({ product_id: editingId, image_url: pub.publicUrl, sort_order: nextOrder })
          .select()
          .single();
        if (insErr) throw insErr;
        setProductImages((prev) => [...prev, inserted as ProductImage]);
      }
      // Sync primary image_url with first image
      await syncPrimaryImage(editingId);
    } catch (err) {
      setError('Error al subir una o más imágenes.');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveProductImage = async (img: ProductImage) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      // Remove from storage (extract path from URL)
      const url = img.image_url;
      const marker = '/product-images/';
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        const path = url.substring(idx + marker.length);
        await supabase.storage.from('product-images').remove([path]);
      }
      await supabase.from('product_images').delete().eq('id', img.id);
      setProductImages((prev) => prev.filter((i) => i.id !== img.id));
      if (editingId) await syncPrimaryImage(editingId);
    } catch {
      setError('Error al eliminar la imagen.');
    }
  };

  const syncPrimaryImage = async (productId: string) => {
    const { data } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1);
    const primary = data && data.length > 0 ? data[0].image_url : null;
    await supabase.from('products').update({ image_url: primary, updated_at: new Date().toISOString() }).eq('id', productId);
    setForm((prev) => ({ ...prev, image_url: primary || '' }));
    setImagePreview(primary);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.replace(/<[^>]*>/g, '').trim() || !form.price.trim()) {
      setError('Nombre, descripción y precio son obligatorios.');
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido.');
      return;
    }

    const baseSlug = slugify(form.slug || form.name);
    if (!baseSlug) {
      setError('No se ha podido generar la URL del producto. Revisa el nombre.');
      return;
    }
    const takenSlugs = products
      .filter((p) => p.id !== editingId && !!p.slug)
      .map((p) => p.slug as string);
    const finalSlug = uniqueSlug(baseSlug, takenSlugs);

    setSaving(true);
    setError(null);

    let imageUrl: string | null = form.image_url.trim() || null;
    let techSheetUrl: string | null = form.tech_sheet_url.trim() || null;

    // Upload image if a new file is selected
    if (imageFile) {
      setUploadingImage(true);
      try {
        const ext = imageFile.name.split('.').pop() || 'jpg';
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);
        if (uploadErr) throw uploadErr;
        const { data: pub } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrl = pub.publicUrl;
      } catch (err) {
        setError('Error al subir la imagen.');
        setSaving(false);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    // Upload PDF if a new file is selected
    if (pdfFile) {
      try {
        const ext = 'pdf';
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('product-docs')
          .upload(filePath, pdfFile);
        if (uploadErr) throw uploadErr;
        const { data: pub } = supabase.storage
          .from('product-docs')
          .getPublicUrl(filePath);
        techSheetUrl = pub.publicUrl;
      } catch (err) {
        setError('Error al subir la ficha técnica.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      slug: finalSlug,
      description: form.description.trim(),
      price: priceNum,
      category: form.category.trim() || 'General',
      image_url: imageUrl,
      tech_sheet_url: techSheetUrl,
      featured: form.featured,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from('products')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);
      if (err) {
        setError('Error al actualizar el producto.');
      } else {
        closeForm();
        loadProducts();
      }
    } else {
      const { data: inserted, error: err } = await supabase.from('products').insert(payload).select().single();
      if (err) {
        setError('Error al crear el producto.');
      } else {
        // If a single image was uploaded, register it in product_images gallery
        if (imageUrl && inserted?.id) {
          await supabase.from('product_images').insert({ product_id: inserted.id, image_url: imageUrl, sort_order: 0 });
        }
        closeForm();
        loadProducts();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    const { error: err } = await supabase.from('products').delete().eq('id', id);
    if (err) {
      setError('Error al eliminar el producto.');
    } else {
      loadProducts();
    }
  };

  const toggleActive = async (p: Product) => {
    const { error: err } = await supabase
      .from('products')
      .update({ is_active: !p.is_active, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    if (err) {
      setError('Error al cambiar el estado del producto.');
    } else {
      loadProducts();
    }
  };

  const toggleFeatured = async (p: Product) => {
    const { error: err } = await supabase
      .from('products')
      .update({ featured: !p.featured, updated_at: new Date().toISOString() })
      .eq('id', p.id);
    if (err) {
      setError('Error al marcar el producto.');
    } else {
      loadProducts();
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Catálogo de productos</h1>
          <p className="text-ink-500 text-sm mt-1">
            {products.length} producto{products.length !== 1 ? 's' : ''} en el catálogo
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Añadir producto
        </button>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm mb-4">No hay productos en el catálogo todavía.</p>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Crear el primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Precio</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Estado</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-ink-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-ink-900 text-sm flex items-center gap-2">
                            {p.name}
                            {p.featured && <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />}
                            {p.tech_sheet_url && <FileText className="w-3.5 h-3.5 text-primary-500" aria-label="Tiene ficha técnica" />}
                          </div>
                          <div className="text-xs text-ink-400 truncate max-w-xs">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 bg-ink-100 text-ink-600 text-xs font-medium rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-display font-semibold text-ink-900">{formatPrice(p.price)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            p.is_active
                              ? 'bg-success-100 text-success-700 hover:bg-success-200'
                              : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                          }`}
                        >
                          {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {p.is_active ? 'Visible' : 'Oculto'}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`p-2 rounded-lg transition-colors ${
                            p.featured
                              ? 'text-warning-600 hover:bg-warning-50'
                              : 'text-ink-400 hover:bg-ink-100'
                          }`}
                          title={p.featured ? 'Quitar destacado' : 'Marcar destacado'}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-warning-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEditForm(p)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-ink-100">
            {products.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-ink-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-ink-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 text-sm flex items-center gap-2">
                      {p.name}
                      {p.featured && <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />}
                    </div>
                    <div className="text-xs text-ink-400 mt-0.5">{p.category}</div>
                  </div>
                  <span className="font-display font-semibold text-ink-900 text-sm whitespace-nowrap">
                    {formatPrice(p.price)}
                  </span>
                </div>
                <p className="text-sm text-ink-500 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg ${
                      p.is_active ? 'bg-success-100 text-success-700' : 'bg-ink-100 text-ink-500'
                    }`}
                  >
                    {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {p.is_active ? 'Visible' : 'Oculto'}
                  </button>
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg ${
                      p.featured ? 'bg-warning-100 text-warning-700' : 'bg-ink-100 text-ink-500'
                    }`}
                  >
                    <Star className={`w-3 h-3 ${p.featured ? 'fill-warning-500' : ''}`} /> Destacado
                  </button>
                  <button
                    onClick={() => openEditForm(p)}
                    className="ml-auto p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-display font-bold text-lg text-ink-900">
                {editingId ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nombre <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: slugTouched ? prev.slug : slugify(name),
                    }));
                  }}
                  placeholder="Ej. Split Daikin 3500 frigorías"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  URL del producto
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-ink-200 bg-ink-50 focus-within:ring-2 focus-within:ring-primary-500">
                  <span className="flex items-center gap-1.5 border-r border-ink-200 px-3 text-xs text-ink-500 whitespace-nowrap">
                    <Link2 className="w-3.5 h-3.5" /> climont.es/productos/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm({ ...form, slug: e.target.value });
                    }}
                    placeholder="split-daikin-3500-frigorias"
                    className="w-full bg-transparent px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  {form.slug && !SLUG_PATTERN.test(form.slug)
                    ? `Se guardará como “${slugify(form.slug)}” (minúsculas, sin acentos ni símbolos).`
                    : 'Se genera sola a partir del nombre. Mejor corta, en minúsculas y con guiones.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Descripción <span className="text-error-500">*</span>
                </label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Descripción del producto, características, qué incluye..."
                  rows={6}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Precio (€) <span className="text-error-500">*</span>
                  </label>
                  <div className="relative">
                    <Euro className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Categoría</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Splits, Conductos, Aerotermia..."
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Imagen del producto
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl bg-ink-100 border border-ink-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-ink-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {imageFile ? 'Cambiar imagen' : 'Subir imagen'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-100 hover:bg-error-50 text-ink-600 hover:text-error-600 text-sm font-medium rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" /> Quitar
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-ink-400">JPG, PNG o WEBP. Máximo 5 MB. Si no subes archivo, puedes indicar una URL externa.</p>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="O pega una URL de imagen (https://...)"
                      disabled={!!imageFile}
                      className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery of multiple images */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Galería de imágenes (múltiples)
                </label>
                {!editingId ? (
                  <p className="text-xs text-ink-400">Guarda el producto primero para poder añadir más imágenes.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {productImages.map((img) => (
                        <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-ink-200 bg-ink-100 group">
                          <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveProductImage(img)}
                            className="absolute top-1 right-1 p-1 bg-ink-950/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadingImages && (
                        <div className="w-20 h-20 rounded-lg border border-ink-200 bg-ink-50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      {uploadingImages ? 'Subiendo...' : 'Añadir imágenes'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesSelect}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                    </label>
                    <p className="text-xs text-ink-400 mt-1.5">Puedes seleccionar varias a la vez. JPG, PNG o WEBP. Máx 5 MB por imagen.</p>
                  </>
                )}
              </div>

              {/* Tech sheet PDF upload */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Ficha técnica (PDF)
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {pdfFile ? 'Cambiar PDF' : 'Subir PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfSelect}
                      className="hidden"
                    />
                  </label>
                  {pdfName && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink-100 text-ink-700 text-sm rounded-lg">
                      <span className="truncate max-w-[200px]">{pdfName}</span>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="text-ink-400 hover:text-error-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-400 mt-1.5">Solo archivos PDF. Máximo 20 MB.</p>
                <input
                  type="text"
                  value={form.tech_sheet_url}
                  onChange={(e) => setForm({ ...form, tech_sheet_url: e.target.value })}
                  placeholder="O pega una URL del PDF (https://...)"
                  disabled={!!pdfFile}
                  className="mt-2 w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-end gap-5 pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-ink-700">Destacado</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-ink-700">Visible</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Vista previa
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-ink-100 bg-white px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900">Vista previa del producto</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('card')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      previewTab === 'card' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    Tarjeta del catálogo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('page')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      previewTab === 'page' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                    }`}
                  >
                    Ficha del producto
                  </button>
                </div>
                <button onClick={() => setShowPreview(false)} className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {previewTab === 'card' ? (
                <div className="mx-auto w-full max-w-sm">
                  <article className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
                      {imagePreview || form.image_url ? (
                        <img src={imagePreview || form.image_url} alt={form.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-ink-300" />
                        </div>
                      )}
                      {form.featured && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-warning-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                          <Star className="h-3 w-3 fill-white" /> Destacado
                        </span>
                      )}
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-700 shadow-sm backdrop-blur">
                        {form.category || 'General'}
                      </span>
                      {productImages.length > 1 && (
                        <span className="absolute bottom-3 right-3 rounded-full bg-ink-900/70 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                          {productImages.length} fotos
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 line-clamp-2 font-display text-base font-semibold text-ink-900">
                        {form.name || 'Nombre del producto'}
                      </h3>
                      <div
                        className="rich-content mb-4 max-h-24 flex-1 overflow-hidden text-sm leading-relaxed text-ink-500"
                        dangerouslySetInnerHTML={{ __html: form.description || '<p>Sin descripción</p>' }}
                      />
                      <div className="mt-auto border-t border-ink-100 pt-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-1">
                            <Euro className="h-4 w-4 text-primary-600" />
                            <span className="font-display text-xl font-bold text-ink-900">
                              {isNaN(parseFloat(form.price)) ? '0,00 €' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(parseFloat(form.price))}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                            Ver detalles <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {form.tech_sheet_url && (
                            <a
                              href={form.tech_sheet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-primary-500/20 transition-colors hover:bg-primary-700"
                            >
                              <FileText className="h-3.5 w-3.5" /> Ficha técnica PDF
                            </a>
                          )}
                          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700">
                            <MessageCircle className="h-3.5 w-3.5" /> Consultar
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-ink-100">
                      {imagePreview || form.image_url ? (
                        <img src={imagePreview || form.image_url} alt={form.name} className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-ink-300" />
                      )}
                    </div>
                    {productImages.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {productImages.slice(0, 4).map((img) => (
                          <img key={img.id} src={img.image_url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">{form.category || 'General'}</span>
                      {form.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2.5 py-1 text-xs font-semibold text-warning-700">
                          <Star className="h-3 w-3 fill-warning-500" /> Destacado
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${form.is_active ? 'bg-success-100 text-success-700' : 'bg-ink-100 text-ink-500'}`}>
                        {form.is_active ? 'Visible' : 'Oculto'}
                      </span>
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-bold leading-tight text-ink-900">{form.name || 'Nombre del producto'}</h3>
                    <div className="mb-4 rounded-xl border border-ink-100 bg-white p-4">
                      <div className="rich-content text-sm leading-relaxed text-ink-600" dangerouslySetInnerHTML={{ __html: form.description || '<p class="text-ink-400">Sin descripción</p>' }} />
                    </div>
                    <div className="mb-4 flex items-baseline gap-2">
                      <Euro className="h-5 w-5 text-primary-600" />
                      <span className="font-display text-3xl font-bold text-ink-900">
                        {isNaN(parseFloat(form.price)) ? '0,00 €' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(parseFloat(form.price))}
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-3">
                      <ShieldCheck className="h-5 w-5 flex-shrink-0 text-success-600" />
                      <p className="text-xs font-medium text-success-800">3 años de garantía total en equipos e instalación</p>
                    </div>
                    {form.tech_sheet_url && (
                      <a
                        href={form.tech_sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-3 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-4 py-3 text-white shadow-lg shadow-primary-600/30 transition-transform hover:-translate-y-0.5"
                      >
                        <FileText className="h-5 w-5" />
                        <span className="flex flex-col text-left leading-tight">
                          <span className="font-display text-sm font-bold">Ficha técnica en PDF</span>
                          <span className="text-[11px] text-primary-100">Se abre en una pestaña nueva</span>
                        </span>
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white">
                        <Phone className="h-4 w-4" /> Llamar ahora
                      </span>
                      <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-success-600 px-4 py-2.5 text-xs font-semibold text-white">
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </span>
                      <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink-700">
                        <Mail className="h-4 w-4" /> Email
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <p className="mt-6 border-t border-ink-100 pt-4 text-xs text-ink-400">
                Aproximación con los datos actuales del formulario. El resultado final puede variar ligeramente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
