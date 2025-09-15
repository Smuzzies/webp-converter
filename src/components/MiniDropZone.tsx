import { useState, DragEvent } from 'react';
import { Plus } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '../utils/cn';

interface MiniDropZoneProps {
  onFilesSelected: (paths: string[]) => void;
  disabled?: boolean;
}

export function MiniDropZone({ onFilesSelected, disabled }: MiniDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    // Files are handled by the global Tauri listener
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
      });
      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        onFilesSelected(paths);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };

  return (
    <div 
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        "w-full mb-2 py-2 px-3 border-2 border-dashed rounded transition-all cursor-pointer group",
        isDragging ? "border-yellow-400 bg-yellow-400/10" : "bg-gray-800/30 border-gray-600",
        !isDragging && "hover:border-yellow-400/50 hover:bg-gray-700/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-center gap-2 pointer-events-none">
        <Plus className={cn(
          "w-4 h-4 transition-colors",
          isDragging ? "text-yellow-400" : "text-gray-400 group-hover:text-yellow-400"
        )} />
        <span className={cn(
          "text-xs transition-colors",
          isDragging ? "text-yellow-400" : "text-gray-400 group-hover:text-gray-300"
        )}>
          {isDragging ? 'Drop images here' : 'Add more images (click or drag here)'}
        </span>
      </div>
    </div>
  );
}