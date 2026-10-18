import { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, Download, RotateCw, ExternalLink } from 'lucide-react';
import { FileTypeIcon } from '@/components/admin/FileTypeIcon';
import type { PDFDocumentProxy } from 'pdfjs-dist';

type PdfViewerProps = {
  url: string;
  fileName: string;
  onDownload: () => void;
};

export function PdfViewer({ url, fileName, onDownload }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocRef, setPdfDocRef] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;

        const loadingTask = pdfjsLib.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfDocRef(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error('PDF load error:', e);
          setError('No se pudo cargar el PDF: ' + (e instanceof Error ? e.message : 'error desconocido'));
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (pdfDocRef) {
      return () => {
        try { pdfDocRef.cleanup(); } catch { return; }
      };
    }
  }, [pdfDocRef]);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef || !containerRef.current) return;
    try {
      const page = await pdfDocRef.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1), rotation });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
      canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      await page.render({ canvas, canvasContext: context, viewport, transform }).promise;

      containerRef.current.innerHTML = '';
      canvas.className = 'bg-white rounded-lg shadow-2xl mx-auto';
      containerRef.current.appendChild(canvas);
    } catch (e) {
      console.error('Page render error:', e);
    }
  }, [pdfDocRef, scale, rotation]);

  useEffect(() => {
    if (!loading && pdfDocRef) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, rotation, loading, pdfDocRef, renderPage]);

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNext = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-success-400 animate-spin" />
        <span className="text-success-300 text-sm">Cargando PDF...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-error-400">
          <FileTypeIcon name="file.pdf" className="w-8 h-8" />
          <span className="text-sm">{error}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Abrir en nueva pestaña
          </a>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Descargar archivo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-ink-800 text-white rounded-t-lg flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            disabled={currentPage <= 1}
            className="p-1.5 hover:bg-ink-700 rounded-lg disabled:opacity-30 transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium px-2 select-none whitespace-nowrap">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage >= numPages}
            className="p-1.5 hover:bg-ink-700 rounded-lg disabled:opacity-30 transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 hover:bg-ink-700 rounded-lg disabled:opacity-30 transition-colors"
            title="Reducir"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium px-1 select-none whitespace-nowrap w-14 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 4}
            className="p-1.5 hover:bg-ink-700 rounded-lg disabled:opacity-30 transition-colors"
            title="Ampliar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-ink-600 mx-1" />
          <button
            onClick={rotate}
            className="p-1.5 hover:bg-ink-700 rounded-lg transition-colors"
            title="Rotar"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400 truncate max-w-[180px] hidden sm:block">{fileName}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-success-600 hover:bg-success-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div className="flex-1 overflow-auto bg-ink-100 flex items-start justify-center p-4">
        <div ref={containerRef} className="flex items-start justify-center" />
      </div>
    </div>
  );
}
