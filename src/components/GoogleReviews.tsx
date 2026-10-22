import { useState, useEffect } from 'react';
import { Star, Quote, ExternalLink, Loader2 } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';

type Review = {
  id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  review_text: string;
  review_date: string;
  service_label: string;
};

type GoogleData = {
  rating: number;
  totalReviews: number;
  mapsUrl: string;
};

const DEFAULT_MAPS_URL = 'https://www.google.com/maps/place/Climatizaciones+Monta%C3%B1o,+S.L./@37.3176281,-5.8527118,17z/data=!3m1!4b1!4m6!3m5!1s0xd127b2ef43b6e99:0x96892f07f3140bbf!8m2!3d37.3176239!4d-5.8501369!16s%2Fg%2F1tdgr28l?entry=ttu';

export function GoogleReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleData, setGoogleData] = useState<GoogleData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const { supabase } = await import('@/lib/supabase');
      // Load admin-managed reviews from DB
      const { data: dbReviews } = await supabase
        .from('reviews')
        .select('id, author_name, author_initial, rating, review_text, review_date, service_label')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (cancelled) return;
      setReviews(dbReviews || []);

      // Fetch real Google rating + review count from edge function
      try {
        const fnUrl = `${SUPABASE_URL}/functions/v1/google-reviews`;
        const res = await fetch(fnUrl, {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        if (res.ok) {
          const funcData = await res.json();
          if (!cancelled && funcData && !funcData.error) {
            setGoogleData({
              rating: funcData.rating || 0,
              totalReviews: funcData.totalReviews || 0,
              mapsUrl: funcData.mapsUrl || DEFAULT_MAPS_URL,
            });
          }
        }
      } catch {
        // Edge function not available — fallback to defaults
        if (!cancelled) {
          setGoogleData({ rating: 0, totalReviews: 0, mapsUrl: DEFAULT_MAPS_URL });
        }
      }

      if (!cancelled) setLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const rating = googleData?.rating ?? 0;
  const reviewCount = googleData?.totalReviews ?? 0;
  const mapsUrl = googleData?.mapsUrl || DEFAULT_MAPS_URL;

  return (
    <section id="resenas" className="py-10 lg:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-3">
            Reseñas de Google
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mb-3">
            Lo que dicen nuestros clientes
          </h2>
          <div className="flex items-center justify-center gap-2.5 mt-4">
            {loading ? (
              <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
            ) : (
              <>
                {rating > 0 && (
                  <>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i <= Math.round(rating) ? 'text-warning-400 fill-warning-400' : 'text-ink-200 fill-ink-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-display text-xl font-bold text-ink-900">{rating.toFixed(1)}</span>
                    <span className="text-ink-500">·</span>
                    <span className="text-ink-600 text-sm">{reviewCount} reseñas en Google</span>
                  </>
                )}
              </>
            )}
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 transition-colors"
          >
            Ver todas las reseñas en Google
            <ExternalLink className="w-4 h-4" />
          </a>
        </Reveal>

        {/* Reviews grid */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-ink-400 mb-3 text-sm">Aún no hay reseñas publicadas en la web.</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              Ver las {reviewCount} reseñas en Google
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reviews.slice(0, 4).map((review, index) => (
              <Reveal key={review.id} delay={index * 60}>
                <div className="group h-full bg-ink-50 rounded-xl p-5 border border-ink-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-warning-400 fill-warning-400' : 'text-ink-200 fill-ink-200'}`}
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-primary-200 group-hover:text-primary-300 transition-colors" />
                  </div>
                  <p className="text-ink-600 text-sm leading-relaxed flex-grow mb-4 line-clamp-4">
                    {review.review_text}
                  </p>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-ink-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-xs">
                      {review.author_initial || review.author_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 text-sm truncate">{review.author_name}</p>
                      {review.review_date && <p className="text-ink-400 text-xs">{review.review_date}</p>}
                    </div>
                  </div>
                  {review.service_label && (
                    <div className="mt-2.5">
                      <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                        {review.service_label}
                      </span>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal className="text-center mt-8">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            Dejar tu reseña en Google
            <ExternalLink className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
