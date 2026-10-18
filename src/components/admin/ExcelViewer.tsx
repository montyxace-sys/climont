import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Save, Plus, Trash2, Search,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Palette, Undo2, Redo2, Grid3x3,
} from 'lucide-react';
import { FileTypeIcon } from '@/components/admin/FileTypeIcon';

type Sheet = { name: string; rows: string[][] };

type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  bgColor?: string;
};

type Props = {
  sheets: Sheet[];
  activeSheet: number;
  setActiveSheet: (i: number) => void;
  visibleRows: number;
  loadMore: () => void;
  fileName?: string;
  onDownload?: () => void;
};

const EXCEL_GREEN = '#107c41';
const HEADER_BG = '#f3f3f3';
const HEADER_BORDER = '#d4d4d4';
const CELL_BORDER = '#e0e0e0';
const ROW_HOVER = '#e8f5e9';
const SELECTED_BORDER = '#107c41';
const SELECTED_BG = '#c6e7d5';

function columnLabel(index: number): string {
  let label = '';
  let n = index;
  while (n >= 0) {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function isNumeric(value: string): boolean {
  if (!value) return false;
  return !isNaN(Number(value)) && value.trim() !== '';
}

function isDate(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime()) && /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(value);
}

const formatKey = (sheetIdx: number, row: number, col: number) => `${sheetIdx}:${row}:${col}`;

export function ExcelViewer({ sheets, activeSheet, setActiveSheet, visibleRows, loadMore, fileName, onDownload }: Props) {
  const sheet = sheets[activeSheet];
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [cellData, setCellData] = useState<Record<string, string>>({});
  const [formats, setFormats] = useState<Record<string, CellFormat>>({});
  const [history, setHistory] = useState<Record<string, string>[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [colWidths, setColWidths] = useState<Record<number, number>>({});
  const [resizing, setResizing] = useState<{ col: number; startX: number; startWidth: number } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragFillRef = useRef<{ startRow: number; startCol: number; endRow: number; endCol: number } | null>(null);
  const [fillRange, setFillRange] = useState<{ sr: number; sc: number; er: number; ec: number } | null>(null);

  const maxCols = useMemo(() => {
    if (!sheet) return 0;
    return Math.max(...sheet.rows.map((r) => r.length), 0);
  }, [sheet]);

  useEffect(() => {
    setSelectedCell(null);
    setEditingCell(null);
    setFillRange(null);
  }, [activeSheet]);

  const getCellValue = useCallback((row: number, col: number): string => {
    const key = formatKey(activeSheet, row, col);
    if (cellData[key] !== undefined) return cellData[key];
    return sheet?.rows[row]?.[col] || '';
  }, [activeSheet, cellData, sheet]);

  const getCellFormat = useCallback((row: number, col: number): CellFormat => {
    const key = formatKey(activeSheet, row, col);
    return formats[key] || {};
  }, [activeSheet, formats]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => {
      const newHist = prev.slice(0, historyIdx + 1);
      newHist.push({ ...cellData });
      if (newHist.length > 50) newHist.shift();
      return newHist;
    });
    setHistoryIdx((prev) => Math.min(prev + 1, 49));
  }, [cellData, historyIdx]);

  const updateCell = useCallback((row: number, col: number, value: string) => {
    pushHistory();
    const key = formatKey(activeSheet, row, col);
    setCellData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, [activeSheet, pushHistory]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const prevIdx = historyIdx - 1;
    setHistoryIdx(prevIdx);
    setCellData(history[prevIdx] || {});
    setHasChanges(true);
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const nextIdx = historyIdx + 1;
    setHistoryIdx(nextIdx);
    setCellData(history[nextIdx] || {});
    setHasChanges(true);
  }, [history, historyIdx]);

  const updateFormat = useCallback((key: string, partial: Partial<CellFormat>) => {
    setFormats((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...partial },
    }));
    setHasChanges(true);
  }, []);

  const toggleFormat = useCallback((prop: 'bold' | 'italic' | 'underline') => {
    if (!selectedCell) return;
    const key = formatKey(activeSheet, selectedCell.row, selectedCell.col);
    const current = getCellFormat(selectedCell.row, selectedCell.col);
    updateFormat(key, { [prop]: !current[prop] });
  }, [selectedCell, activeSheet, getCellFormat, updateFormat]);

  const setAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (!selectedCell) return;
    const key = formatKey(activeSheet, selectedCell.row, selectedCell.col);
    updateFormat(key, { align });
  }, [selectedCell, activeSheet, updateFormat]);

  const setColor = useCallback((prop: 'color' | 'bgColor', color: string) => {
    if (!selectedCell) return;
    const key = formatKey(activeSheet, selectedCell.row, selectedCell.col);
    updateFormat(key, { [prop]: color });
  }, [selectedCell, activeSheet, updateFormat]);

  const startEdit = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
    setEditValue(getCellValue(row, col));
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  }, [getCellValue]);

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const { row, col } = editingCell;
    if (getCellValue(row, col) !== editValue) {
      updateCell(row, col, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, getCellValue, updateCell]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        if (selectedCell) {
          setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        if (selectedCell) {
          const newCol = e.shiftKey ? Math.max(0, selectedCell.col - 1) : selectedCell.col + 1;
          setSelectedCell({ row: selectedCell.row, col: newCol });
        }
      }
      return;
    }

    if (!selectedCell) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCell({ row: Math.max(0, selectedCell.row - 1), col: selectedCell.col });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedCell({ row: selectedCell.row, col: Math.max(0, selectedCell.col - 1) });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedCell({ row: selectedCell.row, col: selectedCell.col + 1 });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      startEdit(selectedCell.row, selectedCell.col);
    } else if (e.key === 'F2') {
      e.preventDefault();
      startEdit(selectedCell.row, selectedCell.col);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      updateCell(selectedCell.row, selectedCell.col, '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const newCol = e.shiftKey ? Math.max(0, selectedCell.col - 1) : selectedCell.col + 1;
      setSelectedCell({ row: selectedCell.row, col: newCol });
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); undo(); }
      else if (e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'b') { e.preventDefault(); toggleFormat('bold'); }
      else if (e.key === 'i') { e.preventDefault(); toggleFormat('italic'); }
      else if (e.key === 'u') { e.preventDefault(); toggleFormat('underline'); }
      else if (e.key === 'f') { e.preventDefault(); setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 0); }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      startEdit(selectedCell.row, selectedCell.col);
      setEditValue(e.key);
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.value = e.key;
          const len = e.key.length;
          editInputRef.current.setSelectionRange(len, len);
        }
      }, 0);
    }
  }, [editingCell, selectedCell, startEdit, commitEdit, cancelEdit, updateCell, undo, redo, toggleFormat]);

  const addRow = useCallback(() => {
    const newKey = `newRow:${activeSheet}:${sheets[activeSheet].rows.length}`;
    pushHistory();
    setCellData((prev) => ({ ...prev, [newKey]: '' }));
    setHasChanges(true);
  }, [activeSheet, sheets, pushHistory]);

  const handleDownloadXlsx = useCallback(async () => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    sheets.forEach((s, sheetIdx) => {
      const maxC = Math.max(...s.rows.map((r) => r.length), 0);
      const aoa: (string | number)[][] = [];
      for (let r = 0; r < s.rows.length; r++) {
        const row: (string | number)[] = [];
        for (let c = 0; c < maxC; c++) {
          const key = formatKey(sheetIdx, r, c);
          const val = cellData[key] !== undefined ? cellData[key] : (s.rows[r]?.[c] || '');
          const num = Number(val);
          row.push(val !== '' && !isNaN(num) && isNumeric(val) ? num : val);
        }
        aoa.push(row);
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(workbook, ws, s.name.substring(0, 31));
    });

    XLSX.writeFile(workbook, fileName || 'hoja-editada.xlsx');
    setHasChanges(false);
  }, [sheets, cellData, fileName]);

  const searchMatches = useMemo(() => {
    if (!search.trim() || !sheet) return [];
    const matches: { row: number; col: number }[] = [];
    const term = search.toLowerCase();
    for (let r = 0; r < sheet.rows.length; r++) {
      for (let c = 0; c < (sheet.rows[r]?.length || 0); c++) {
        if (getCellValue(r, c).toLowerCase().includes(term)) {
          matches.push({ row: r, col: c });
        }
      }
    }
    return matches;
  }, [search, sheet, getCellValue]);

  const [searchIdx, setSearchIdx] = useState(0);
  const goToSearchResult = useCallback((dir: 1 | -1) => {
    if (searchMatches.length === 0) return;
    const newIdx = (searchIdx + dir + searchMatches.length) % searchMatches.length;
    setSearchIdx(newIdx);
    const m = searchMatches[newIdx];
    setSelectedCell({ row: m.row, col: m.col });
    const cellEl = containerRef.current?.querySelector(`[data-cell="${m.row}-${m.col}"]`);
    cellEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [searchMatches, searchIdx]);

  const handleColResizeMouseDown = useCallback((e: React.MouseEvent, col: number) => {
    e.preventDefault();
    e.stopPropagation();
    const currentWidth = colWidths[col] || 100;
    setResizing({ col, startX: e.clientX, startWidth: currentWidth });
  }, [colWidths]);

  useEffect(() => {
    if (!resizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(40, resizing.startWidth + delta);
      setColWidths((prev) => ({ ...prev, [resizing.col]: newWidth }));
    };
    const handleMouseUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const getColWidth = (col: number) => colWidths[col] || 100;

  const selectedCellRef = selectedCell ? `${columnLabel(selectedCell.col)}${selectedCell.row + 1}` : '';
  const selectedValue = selectedCell ? getCellValue(selectedCell.row, selectedCell.col) : '';
  const selectedFmt = selectedCell ? getCellFormat(selectedCell.row, selectedCell.col) : {};

  if (!sheet) {
    return <span className="text-error-400 text-sm">No se pudo mostrar el archivo</span>;
  }

  const visibleData = sheet.rows.slice(0, visibleRows);
  const totalRows = sheet.rows.length;

  const handleCellMouseDown = (row: number, col: number) => {
    if (editingCell) commitEdit();
    setSelectedCell({ row, col });
    dragFillRef.current = { startRow: row, startCol: col, endRow: row, endCol: col };
    setFillRange({ sr: row, sc: col, er: row, ec: col });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (dragFillRef.current) {
      dragFillRef.current.endRow = row;
      dragFillRef.current.endCol = col;
      setFillRange({
        sr: Math.min(dragFillRef.current.startRow, row),
        sc: Math.min(dragFillRef.current.startCol, col),
        er: Math.max(dragFillRef.current.startRow, row),
        ec: Math.max(dragFillRef.current.startCol, col),
      });
    }
  };

  const handleMouseUp = () => {
    dragFillRef.current = null;
  };

  const isInFillRange = (row: number, col: number): boolean => {
    if (!fillRange) return false;
    return row >= fillRange.sr && row <= fillRange.er && col >= fillRange.sc && col <= fillRange.ec;
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      onMouseUp={handleMouseUp}
      tabIndex={0}
    >
      {/* Toolbar estilo cinta de Office */}
      <div className="flex items-center gap-1 px-2 py-1 bg-white border-b flex-wrap" style={{ borderColor: HEADER_BORDER }}>
        <button
          onClick={(e) => { e.stopPropagation(); undo(); }}
          disabled={historyIdx <= 0}
          className="p-1.5 rounded hover:bg-ink-100 disabled:opacity-30 transition-colors"
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4 text-ink-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); redo(); }}
          disabled={historyIdx >= history.length - 1}
          className="p-1.5 rounded hover:bg-ink-100 disabled:opacity-30 transition-colors"
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4 text-ink-700" />
        </button>

        <div className="w-px h-5 bg-ink-200 mx-1" />

        <button
          onClick={(e) => { e.stopPropagation(); toggleFormat('bold'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.bold ? 'bg-ink-200' : ''}`}
          title="Negrita (Ctrl+B)"
        >
          <Bold className="w-4 h-4 text-ink-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFormat('italic'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.italic ? 'bg-ink-200' : ''}`}
          title="Cursiva (Ctrl+I)"
        >
          <Italic className="w-4 h-4 text-ink-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFormat('underline'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.underline ? 'bg-ink-200' : ''}`}
          title="Subrayado (Ctrl+U)"
        >
          <Underline className="w-4 h-4 text-ink-700" />
        </button>

        <div className="w-px h-5 bg-ink-200 mx-1" />

        <button
          onClick={(e) => { e.stopPropagation(); setAlign('left'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.align === 'left' ? 'bg-ink-200' : ''}`}
          title="Izquierda"
        >
          <AlignLeft className="w-4 h-4 text-ink-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setAlign('center'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.align === 'center' ? 'bg-ink-200' : ''}`}
          title="Centro"
        >
          <AlignCenter className="w-4 h-4 text-ink-700" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setAlign('right'); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${selectedFmt.align === 'right' ? 'bg-ink-200' : ''}`}
          title="Derecha"
        >
          <AlignRight className="w-4 h-4 text-ink-700" />
        </button>

        <div className="w-px h-5 bg-ink-200 mx-1" />

        <label className="flex items-center gap-1 px-1 rounded hover:bg-ink-100 transition-colors cursor-pointer" title="Color de texto">
          <Palette className="w-4 h-4 text-ink-700" />
          <input
            type="color"
            className="w-5 h-5 border-0 cursor-pointer bg-transparent"
            onChange={(e) => setColor('color', e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 px-1 rounded hover:bg-ink-100 transition-colors cursor-pointer" title="Color de fondo">
          <Grid3x3 className="w-4 h-4 text-ink-700" />
          <input
            type="color"
            className="w-5 h-5 border-0 cursor-pointer bg-transparent"
            onChange={(e) => setColor('bgColor', e.target.value)}
          />
        </label>

        <div className="w-px h-5 bg-ink-200 mx-1" />

        <button
          onClick={(e) => { e.stopPropagation(); setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 0); }}
          className={`p-1.5 rounded hover:bg-ink-100 transition-colors ${showSearch ? 'bg-ink-200' : ''}`}
          title="Buscar (Ctrl+F)"
        >
          <Search className="w-4 h-4 text-ink-700" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); addRow(); }}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-ink-700 rounded hover:bg-ink-100 transition-colors"
          title="Anadir fila"
        >
          <Plus className="w-3.5 h-3.5" />
          Fila
        </button>

        <div className="flex-1" />

        <button
          onClick={(e) => { e.stopPropagation(); handleDownloadXlsx(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
          style={{ backgroundColor: EXCEL_GREEN }}
          title="Descargar como Excel"
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? 'Guardar XLSX *' : 'Guardar XLSX'}
        </button>
        {onDownload && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-700 bg-ink-100 hover:bg-ink-200 rounded transition-colors"
            title="Descargar original"
          >
            <Download className="w-3.5 h-3.5" />
            Original
          </button>
        )}
      </div>

      {/* Barra de busqueda */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-50 border-b" style={{ borderColor: HEADER_BORDER }} onClick={(e) => e.stopPropagation()}>
          <Search className="w-4 h-4 text-ink-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchIdx(0); }}
            placeholder="Buscar en la hoja..."
            className="flex-1 px-2 py-1 text-xs bg-white border rounded outline-none focus:ring-1"
            style={{ borderColor: HEADER_BORDER }}
          />
          <span className="text-xs text-ink-500 whitespace-nowrap">
            {searchMatches.length > 0 ? `${searchIdx + 1} / ${searchMatches.length}` : '0 resultados'}
          </span>
          <button onClick={() => goToSearchResult(-1)} disabled={searchMatches.length === 0} className="p-1 rounded hover:bg-ink-200 disabled:opacity-30">
            <ChevronLeft className="w-3.5 h-3.5 text-ink-600" />
          </button>
          <button onClick={() => goToSearchResult(1)} disabled={searchMatches.length === 0} className="p-1 rounded hover:bg-ink-200 disabled:opacity-30">
            <ChevronRight className="w-3.5 h-3.5 text-ink-600" />
          </button>
          <button onClick={() => { setShowSearch(false); setSearch(''); }} className="p-1 rounded hover:bg-ink-200">
            <Trash2 className="w-3.5 h-3.5 text-ink-400" />
          </button>
        </div>
      )}

      {/* Barra de formula estilo Excel */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white border-b" style={{ borderColor: HEADER_BORDER }}>
        <div className="flex items-center gap-1 min-w-[70px]">
          <span
            className="px-2 py-0.5 text-xs font-bold text-white rounded"
            style={{ backgroundColor: EXCEL_GREEN }}
          >
            {selectedCellRef || '—'}
          </span>
        </div>
        <div className="text-ink-400 text-sm">fx</div>
        {editingCell ? (
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitEdit(); if (selectedCell) setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col }); }
              else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
              e.stopPropagation();
            }}
            className="flex-1 px-2 py-1 text-xs text-ink-900 bg-white border rounded outline-none font-mono"
            style={{ borderColor: EXCEL_GREEN }}
          />
        ) : (
          <div className="flex-1 px-2 py-1 text-xs text-ink-700 bg-ink-50 border rounded font-mono truncate" style={{ borderColor: HEADER_BORDER }}>
            {selectedValue || ''}
          </div>
        )}
      </div>

      {/* Tabla con cabeceras de columna */}
      <div ref={containerRef} className="flex-1 overflow-auto select-none" style={{ scrollbarColor: `${EXCEL_GREEN} transparent` }}>
        <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th
                className="sticky top-0 left-0 z-20 px-1 py-0.5 text-[10px] font-semibold text-ink-500 select-none"
                style={{
                  backgroundColor: HEADER_BG,
                  borderRight: `1px solid ${HEADER_BORDER}`,
                  borderBottom: `1px solid ${HEADER_BORDER}`,
                  width: 36,
                  minWidth: 36,
                }}
              >
                <FileTypeIcon name="file.xlsx" className="w-3 h-3 inline" />
              </th>
              {Array.from({ length: maxCols }, (_, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 text-[10px] font-semibold select-none text-center relative"
                  style={{
                    backgroundColor: selectedCell?.col === i ? EXCEL_GREEN : HEADER_BG,
                    color: selectedCell?.col === i ? '#fff' : '#5a5a5a',
                    borderRight: `1px solid ${HEADER_BORDER}`,
                    borderBottom: `1px solid ${HEADER_BORDER}`,
                    minWidth: getColWidth(i),
                    width: getColWidth(i),
                  }}
                >
                  {columnLabel(i)}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-ink-300"
                    onMouseDown={(e) => handleColResizeMouseDown(e, i)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, ri) => (
              <tr key={ri} style={{ height: 22 }}>
                <td
                  className="sticky left-0 z-10 px-1 py-0 text-[10px] font-semibold text-center select-none"
                  style={{
                    backgroundColor: selectedCell?.row === ri ? EXCEL_GREEN : isInFillRange(ri, -1) ? ROW_HOVER : HEADER_BG,
                    color: selectedCell?.row === ri ? '#fff' : '#5a5a5a',
                    borderRight: `1px solid ${HEADER_BORDER}`,
                    borderBottom: `1px solid ${CELL_BORDER}`,
                    width: 36,
                    minWidth: 36,
                  }}
                >
                  {ri + 1}
                </td>
                {Array.from({ length: maxCols }, (_, ci) => {
                  const cellValue = getCellValue(ri, ci);
                  const isSelected = selectedCell?.row === ri && selectedCell?.col === ci;
                  const isEditing = editingCell?.row === ri && editingCell?.col === ci;
                  const inRange = isInFillRange(ri, ci);
                  const fmt = getCellFormat(ri, ci);
                  const numeric = isNumeric(cellValue);
                  const date = isDate(cellValue);
                  const align = fmt.align || (numeric ? 'right' : 'left');
                  const isSearchResult = searchMatches.some((m) => m.row === ri && m.col === ci);
                  const isCurrentSearchResult = searchMatches[searchIdx]?.row === ri && searchMatches[searchIdx]?.col === ci;

                  return (
                    <td
                      key={ci}
                      data-cell={`${ri}-${ci}`}
                      onMouseDown={() => handleCellMouseDown(ri, ci)}
                      onMouseEnter={() => handleCellMouseEnter(ri, ci)}
                      onDoubleClick={() => startEdit(ri, ci)}
                      className="px-2 py-0 text-[11px] cursor-cell whitespace-nowrap overflow-hidden text-ellipsis relative"
                      style={{
                        borderRight: `1px solid ${CELL_BORDER}`,
                        borderBottom: `1px solid ${CELL_BORDER}`,
                        backgroundColor: isEditing ? '#fff' : isSelected ? SELECTED_BG : inRange ? ROW_HOVER : fmt.bgColor || (isCurrentSearchResult ? '#ffe082' : isSearchResult ? '#fff9c4' : undefined),
                        color: fmt.color || '#1a1a1a',
                        textAlign: align,
                        minWidth: getColWidth(ci),
                        width: getColWidth(ci),
                        fontFamily: numeric || date ? 'ui-monospace, monospace' : 'inherit',
                        fontWeight: fmt.bold ? 700 : 400,
                        fontStyle: fmt.italic ? 'italic' : 'normal',
                        textDecoration: fmt.underline ? 'underline' : 'none',
                        outline: isSelected ? `2px solid ${SELECTED_BORDER}` : 'none',
                        outlineOffset: '-2px',
                        zIndex: isSelected ? 5 : 1,
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') { e.preventDefault(); commitEdit(); if (selectedCell) setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col }); }
                            else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                            else if (e.key === 'Tab') { e.preventDefault(); commitEdit(); if (selectedCell) { const nc = e.shiftKey ? Math.max(0, selectedCell.col - 1) : selectedCell.col + 1; setSelectedCell({ row: selectedCell.row, col: nc }); } }
                          }}
                          className="w-full h-full px-1 py-0 text-[11px] bg-white border-0 outline-none"
                          style={{
                            textAlign: align,
                            fontFamily: numeric || date ? 'ui-monospace, monospace' : 'inherit',
                            fontWeight: fmt.bold ? 700 : 400,
                            fontStyle: fmt.italic ? 'italic' : 'normal',
                            textDecoration: fmt.underline ? 'underline' : 'none',
                            color: fmt.color || '#1a1a1a',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {visibleRows < totalRows && (
          <div className="sticky bottom-0 left-0 right-0 flex justify-center py-2 bg-white/95 backdrop-blur border-t" style={{ borderColor: HEADER_BORDER }}>
            <button
              onClick={(e) => { e.stopPropagation(); loadMore(); }}
              className="px-4 py-1.5 text-xs font-semibold text-white rounded transition-opacity hover:opacity-90"
              style={{ backgroundColor: EXCEL_GREEN }}
            >
              Cargar mas filas ({visibleRows} de {totalRows})
            </button>
          </div>
        )}
      </div>

      {/* Barra de pestañas de hojas (abajo, como en Excel) */}
      <div className="flex items-center gap-0 px-1 py-0.5 bg-white border-t overflow-x-auto flex-shrink-0" style={{ borderColor: HEADER_BORDER }}>
        <button className="p-1 text-ink-400 hover:text-ink-600 flex-shrink-0" aria-label="Hoja anterior">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button className="p-1 text-ink-400 hover:text-ink-600 flex-shrink-0" aria-label="Hoja siguiente">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-0 ml-1">
          {sheets.map((s, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveSheet(i); setSelectedCell(null); }}
              className="px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: i === activeSheet ? '#fff' : 'transparent',
                color: i === activeSheet ? EXCEL_GREEN : '#5a5a5a',
                borderBottom: i === activeSheet ? `2px solid ${EXCEL_GREEN}` : '2px solid transparent',
                borderRight: `1px solid ${HEADER_BORDER}`,
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Barra de estado inferior */}
      <div className="flex items-center justify-between px-3 py-1 text-[10px] text-white flex-shrink-0" style={{ backgroundColor: EXCEL_GREEN }}>
        <span className="flex items-center gap-2">
          {sheet.name} · {totalRows} filas x {maxCols} columnas
          {hasChanges && <span className="text-yellow-200 font-medium">· Cambios sin guardar</span>}
        </span>
        <span>
          {selectedCell ? `Celda ${selectedCellRef}` : 'Listo'}
          {fillRange && (fillRange.sr !== fillRange.er || fillRange.sc !== fillRange.ec) ? ` · Seleccion: ${Math.abs(fillRange.er - fillRange.sr + 1)}x${Math.abs(fillRange.ec - fillRange.sc + 1)}` : ''}
        </span>
      </div>
    </div>
  );
}
