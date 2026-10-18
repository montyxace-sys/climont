type Props = {
  name: string;
  className?: string;
};

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#E53935" />
      <path d="M14 2v6h6" fill="#EF9A9A" />
      <text x="12" y="17" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

type IconProps = { className?: string };

function ExcelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#107C41" />
      <path d="M14 2v6h6" fill="#54B46A" />
      <text x="12" y="17" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#fff" fontFamily="sans-serif">XLS</text>
    </svg>
  );
}

function WordIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#2B579A" />
      <path d="M14 2v6h6" fill="#5B8FBE" />
      <text x="12" y="17" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#fff" fontFamily="sans-serif">DOC</text>
    </svg>
  );
}

function PowerpointIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#D24726" />
      <path d="M14 2v6h6" fill="#E97456" />
      <text x="12" y="17" textAnchor="middle" fontSize="5" fontWeight="700" fill="#fff" fontFamily="sans-serif">PPT</text>
    </svg>
  );
}

function ImageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#7B3FA0" />
      <path d="M14 2v6h6" fill="#A674C5" />
      <path d="M8 17l3-4 2 2 3-3 4 5H8Z" fill="#fff" />
      <circle cx="9.5" cy="11.5" r="1" fill="#fff" />
    </svg>
  );
}

function VideoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#E91E63" />
      <path d="M14 2v6h6" fill="#F06292" />
      <path d="M10 11l5 3-5 3v-6Z" fill="#fff" />
    </svg>
  );
}

function AudioIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#FF9800" />
      <path d="M14 2v6h6" fill="#FFB74D" />
      <path d="M12 10v6m-2-1a2 2 0 1 0 4 0m-4 0V10l4-1v6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ArchiveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#FBC02D" />
      <path d="M14 2v6h6" fill="#FDD835" />
      <path d="M11 10h2v2h-2zM11 13h2v2h-2zM11 16h2v2h-2z" fill="#fff" />
    </svg>
  );
}

function TextIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#455A64" />
      <path d="M14 2v6h6" fill="#78909C" />
      <path d="M8 12h8v1.5H8zM8 15h6v1.5H8zM8 9h4v1.5H8z" fill="#fff" />
    </svg>
  );
}

function CsvIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#107C41" />
      <path d="M14 2v6h6" fill="#54B46A" />
      <text x="12" y="17" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#fff" fontFamily="sans-serif">CSV</text>
    </svg>
  );
}

function DefaultFileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" fill="#607D8B" />
      <path d="M14 2v6h6" fill="#90A4AE" />
      <path d="M8 12h8v1.5H8zM8 15h6v1.5H8zM8 9h4v1.5H8z" fill="#fff" />
    </svg>
  );
}

export function FileTypeIcon({ name, className = 'w-5 h-5' }: Props) {
  const ext = getExt(name);

  if (['pdf'].includes(ext)) return <PdfIcon className={className} />;
  if (['xls', 'xlsx', 'ods'].includes(ext)) return <ExcelIcon className={className} />;
  if (['csv'].includes(ext)) return <CsvIcon className={className} />;
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return <WordIcon className={className} />;
  if (['ppt', 'pptx', 'odp'].includes(ext)) return <PowerpointIcon className={className} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'].includes(ext)) return <ImageIcon className={className} />;
  if (['mp4', 'webm', 'mov', 'ogg', 'avi', 'mkv', 'flv', 'wmv'].includes(ext)) return <VideoIcon className={className} />;
  if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(ext)) return <AudioIcon className={className} />;
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return <ArchiveIcon className={className} />;
  if (['txt', 'md', 'json', 'html', 'css', 'js', 'ts', 'xml', 'log'].includes(ext)) return <TextIcon className={className} />;

  return <DefaultFileIcon className={className} />;
}
