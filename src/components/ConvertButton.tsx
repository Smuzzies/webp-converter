import { Download, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ConvertButtonProps {
  onClick: () => void;
  isConverting: boolean;
  hasImages: boolean;
  progress?: number;
  total?: number;
}

export function ConvertButton({ 
  onClick, 
  isConverting, 
  hasImages, 
  progress = 0, 
  total = 0 
}: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={!hasImages || isConverting}
      className={cn(
        "flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-all",
        "focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:ring-offset-1 focus:ring-offset-gray-800",
        hasImages && !isConverting && "bg-yellow-400 text-gray-900 hover:bg-yellow-300",
        (!hasImages || isConverting) && "bg-gray-700 text-gray-500 cursor-not-allowed"
      )}
    >
      {isConverting ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{progress}/{total}</span>
        </>
      ) : (
        <>
          <Download className="w-3 h-3" />
          <span>Convert</span>
        </>
      )}
    </button>
  );
}