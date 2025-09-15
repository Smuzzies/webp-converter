import { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image } from 'lucide-react';
import { cn } from '../utils/cn';

interface DragDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

export function DragDropZone({ onFilesAdded, disabled }: DragDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/tiff': ['.tiff']
    },
    onDrop: (acceptedFiles) => {
      console.log('Files dropped:', acceptedFiles);
      onFilesAdded(acceptedFiles);
    },
    multiple: true,
    disabled,
    noClick: false, // Allow clicking
    noKeyboard: false,
  });

  // Fallback for file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected via input:', files);
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded p-3 transition-all cursor-pointer",
        "bg-gray-800/30 backdrop-blur",
        "hover:border-yellow-400/50 hover:bg-gray-700/30",
        isDragActive && "border-yellow-400 bg-yellow-400/10",
        disabled && "opacity-50 cursor-not-allowed hover:border-gray-600 hover:bg-gray-800/30",
        !isDragActive && !disabled && "border-gray-600"
      )}
    >
      <input {...getInputProps()} />
      {/* Hidden file input as fallback */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp,image/tiff"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      
      <div className="flex items-center justify-center space-x-2">
        {isDragActive ? (
          <>
            <Image className="w-4 h-4 text-yellow-400" />
            <p className="text-xs font-medium text-yellow-400">Drop images here</p>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-300">
              Drag images or click to browse
            </p>
            <span className="text-xs text-gray-500">
              (PNG, JPG, GIF, BMP, TIFF)
            </span>
          </>
        )}
      </div>
    </div>
  );
}