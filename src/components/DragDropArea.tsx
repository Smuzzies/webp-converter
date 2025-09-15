import { useState, DragEvent } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '../utils/cn';

interface DragDropAreaProps {
  onFilesSelected: (paths: string[]) => void;
  disabled?: boolean;
}

export function DragDropArea({ onFilesSelected, disabled }: DragDropAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Only handle visual feedback for drag events, not the actual drop
  // The actual file drop is handled by the Tauri event listener
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the component entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    // Don't handle files here - let the Tauri event listener handle it
  };

  const handleClick = async () => {
    if (disabled) return;
    
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff']
        }],
        title: 'Select Images to Convert'
      });
      
      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        console.log('Files selected via dialog:', paths);
        onFilesSelected(paths);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          "group p-8 rounded-lg transition-all cursor-pointer",
          "bg-gray-800/30 hover:bg-gray-700/30",
          "border-2 border-dashed",
          isDragging ? "border-yellow-400 bg-yellow-400/10" : "border-gray-600",
          "hover:border-yellow-400/50",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-600 hover:bg-gray-800/30"
        )}
      >
        <div className="flex flex-col items-center space-y-3 pointer-events-none">
          <div className="relative">
            <FolderOpen className={cn(
              "w-12 h-12 transition-colors",
              isDragging ? "text-yellow-400" : "text-gray-500 group-hover:text-gray-400"
            )} />
            <Upload className="w-5 h-5 text-yellow-400 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <p className={cn(
              "text-sm font-medium transition-colors",
              isDragging ? "text-yellow-400" : "text-gray-300 group-hover:text-gray-200"
            )}>
              {isDragging ? 'Drop Images Here' : 'Select Images'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click to browse or drag files
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-gray-800/50 px-3 py-1 rounded">
            PNG • JPG • GIF • BMP • TIFF
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Convert multiple images to WebP format
        </p>
        <p className="text-xs text-gray-600 mt-1">
          with customizable quality settings
        </p>
      </div>
    </div>
  );
}