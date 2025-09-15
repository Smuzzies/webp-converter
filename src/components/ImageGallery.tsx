import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ImageFile } from '../types';
import { cn } from '../utils/cn';

interface ImageGalleryProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
}

export function ImageGallery({ images, onRemove }: ImageGalleryProps) {
  if (images.length === 0) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + sizes[i];
  };

  const getCompressionRatio = (original: number, compressed?: number) => {
    if (!compressed) return null;
    const ratio = ((original - compressed) / original * 100).toFixed(0);
    return `-${ratio}%`;
  };

  return (
    <div className="grid grid-cols-3 gap-1">
      {images.map((image) => (
        <div
          key={image.id}
          className={cn(
            "relative group rounded overflow-hidden bg-gray-700/30",
            "border transition-all",
            image.status === 'completed' && "border-green-500/50",
            image.status === 'error' && "border-red-500/50",
            image.status === 'converting' && "border-yellow-400 animate-pulse",
            image.status === 'pending' && "border-gray-700"
          )}
        >
          <div className="aspect-square relative bg-gray-900/50">
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-full h-full object-cover"
            />
            
            {/* Status overlay */}
            {image.status !== 'pending' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                {image.status === 'converting' && (
                  <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                )}
                {image.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {image.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 p-0.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Size badges - stacked to avoid cutoff */}
            {image.compressedSize ? (
              <div className="absolute bottom-1 left-1 right-1">
                <div className="flex flex-col gap-0.5 items-start">
                  <span className="text-[10px] bg-black/80 text-gray-300 px-1 rounded">
                    {formatFileSize(image.originalSize)}
                  </span>
                  <span className="text-[10px] bg-green-600/90 text-white px-1 rounded font-bold">
                    {getCompressionRatio(image.originalSize, image.compressedSize)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-1 left-1">
                <span className="text-[10px] bg-black/80 text-gray-300 px-1 rounded">
                  {formatFileSize(image.originalSize)}
                </span>
              </div>
            )}
          </div>

          {/* File name */}
          <div className="px-1 py-0.5 bg-gray-800/50">
            <p className="text-xs truncate text-gray-300" title={image.file.name}>
              {image.file.name.split('.')[0]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}