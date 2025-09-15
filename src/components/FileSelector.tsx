import { Upload, FolderOpen } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '../utils/cn';

interface FileSelectorProps {
  onFilesSelected: (paths: string[]) => void;
  disabled?: boolean;
}

export function FileSelector({ onFilesSelected, disabled }: FileSelectorProps) {
  const handleClick = async () => {
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
        console.log('Files selected:', paths);
        onFilesSelected(paths);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "group p-8 rounded-lg transition-all",
          "bg-gray-800/30 hover:bg-gray-700/30",
          "border-2 border-dashed",
          "hover:border-yellow-400/50",
          disabled && "opacity-50 cursor-not-allowed hover:border-gray-600 hover:bg-gray-800/30",
          !disabled && "border-gray-600 cursor-pointer"
        )}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <FolderOpen className="w-12 h-12 text-gray-500 group-hover:text-gray-400 transition-colors" />
            <Upload className="w-5 h-5 text-yellow-400 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300 group-hover:text-gray-200">
              Select Images
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click to browse
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-gray-800/50 px-3 py-1 rounded">
            PNG • JPG • GIF • BMP • TIFF
          </div>
        </div>
      </button>
      
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