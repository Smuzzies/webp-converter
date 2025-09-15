import { DownloadCloud } from 'lucide-react';
import { cn } from '../utils/cn';
import { ImageFile } from '../types';
import { useDownload } from '../hooks/useDownload';

interface DownloadButtonProps {
  images: ImageFile[];
}

export function DownloadButton({ images }: DownloadButtonProps) {
  const { downloadAll } = useDownload();
  const completedImages = images.filter(img => img.status === 'completed' && img.base64Data);

  if (completedImages.length === 0) return null;

  const handleDownloadAll = () => {
    const imagesToDownload = completedImages.map(img => ({
      base64Data: img.base64Data!,
      fileName: img.outputPath || 'image.webp',
    }));
    downloadAll(imagesToDownload);
  };

  return (
    <button
      onClick={handleDownloadAll}
      className={cn(
        "flex items-center gap-1 px-3 py-1 rounded text-xs font-medium",
        "bg-gray-700 text-yellow-400 hover:bg-gray-600 border border-yellow-400/30",
        "focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:ring-offset-1 focus:ring-offset-gray-800"
      )}
    >
      <DownloadCloud className="w-3 h-3" />
      <span>Save ({completedImages.length})</span>
    </button>
  );
}