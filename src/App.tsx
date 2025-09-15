import { FileImage } from 'lucide-react';
import { useImageStore } from './store/imageStore';
import { DragDropArea } from './components/DragDropArea';
import { MiniDropZone } from './components/MiniDropZone';
import { ImageGallery } from './components/ImageGallery';
import { ConvertButton } from './components/ConvertButton';
import { useFileDrop } from './hooks/useFileDrop';

function App() {
  const {
    images,
    quality,
    namingOptions,
    isConverting,
    progress,
    totalProgress,
    addImagePaths,
    removeImage,
    clearImages,
    setQuality,
    setNamingOptions,
    convertImages,
  } = useImageStore();

  const handleFilesSelected = (paths: string[]) => {
    if (paths.length > 0) {
      addImagePaths(paths);
    }
  };

  // Setup global file drop listener
  useFileDrop(handleFilesSelected);

  const completedCount = images.filter(img => img.status === 'completed').length;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur border-b border-gray-700/50 px-3 py-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileImage className="w-4 h-4 text-yellow-400" />
            <h1 className="text-xs font-semibold text-gray-100">WebP Converter</h1>
          </div>
          {images.length > 0 && (
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-gray-400">
                {images.length} image{images.length !== 1 ? 's' : ''}
                {completedCount > 0 && <span className="text-yellow-400"> • {completedCount} done</span>}
              </span>
              <button
                onClick={clearImages}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Compact Layout */}
      <main className="flex-1 overflow-hidden flex">
        {/* Left Side - Image Gallery or Drag Drop Area */}
        <div className="w-1/2 border-r border-gray-700/50 p-2 flex flex-col">
          {images.length === 0 ? (
            <DragDropArea 
              onFilesSelected={handleFilesSelected} 
              disabled={isConverting}
            />
          ) : (
            <>
              {/* Enhanced mini dropzone for adding more images */}
              <MiniDropZone 
                onFilesSelected={handleFilesSelected}
                disabled={isConverting}
              />
              
              {/* Image Gallery */}
              <div className="flex-1 bg-gray-800/30 rounded border border-gray-700/50 overflow-hidden">
                <div className="h-full overflow-y-auto p-1">
                  <ImageGallery 
                    images={images} 
                    onRemove={removeImage}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side - Settings Panel */}
        <div className="w-1/2 p-2 flex flex-col">
          <div className="bg-gray-800/50 backdrop-blur rounded border border-gray-700/50 p-3 flex-1 flex flex-col">
            <h3 className="text-xs font-medium text-gray-300 mb-3">Conversion Settings</h3>
            
            <div className="space-y-3 flex-1">
              {/* Quality Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Quality</span>
                  <span className="text-xs font-bold text-yellow-400">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={isConverting}
                  className="w-full h-1.5 accent-yellow-400"
                />
                <div className="flex justify-between mt-1">
                  {[30, 60, 85, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => setQuality(val)}
                      className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Naming Options */}
              <div>
                <span className="text-xs text-gray-400">File Naming</span>
                <select
                  value={namingOptions.scheme}
                  onChange={(e) => setNamingOptions({ ...namingOptions, scheme: e.target.value as any })}
                  disabled={isConverting}
                  className="w-full mt-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1.5 focus:border-yellow-400 focus:outline-none"
                >
                  <option value="keep-original">Keep Original Name</option>
                  <option value="add-suffix">Add Suffix</option>
                  <option value="custom">Custom Pattern</option>
                </select>
                {namingOptions.scheme === 'add-suffix' && (
                  <input
                    type="text"
                    value={namingOptions.suffix || '_compressed'}
                    onChange={(e) => setNamingOptions({ ...namingOptions, suffix: e.target.value })}
                    disabled={isConverting}
                    placeholder="Enter suffix"
                    className="w-full mt-1 text-xs bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 focus:border-yellow-400 focus:outline-none"
                  />
                )}
              </div>



              {/* Statistics */}
              {images.length > 0 && (
                <div className="text-xs bg-gray-700/30 rounded p-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Images:</span>
                    <span className="text-gray-200">{images.length}</span>
                  </div>
                  {completedCount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Converted:</span>
                        <span className="text-green-400">{completedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Reduction:</span>
                        <span className="text-yellow-400">
                          {(() => {
                            const completed = images.filter(img => img.status === 'completed' && img.compressedSize);
                            if (completed.length === 0) return '0%';
                            const avgReduction = completed.reduce((acc, img) => {
                              const reduction = ((img.originalSize - (img.compressedSize || 0)) / img.originalSize) * 100;
                              return acc + reduction;
                            }, 0) / completed.length;
                            return `${avgReduction.toFixed(0)}%`;
                          })()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-3 border-t border-gray-700/50">
              <ConvertButton
                onClick={convertImages}
                isConverting={isConverting}
                hasImages={images.length > 0}
                progress={progress}
                total={totalProgress}
              />
              {completedCount > 0 && completedCount === images.length && (
                <div className="text-xs text-center text-green-400 mt-2">
                  ✓ All images saved to disk
                </div>
              )}
            </div>
          </div>

          {/* Footer with Logo */}
          <div className="mt-2 flex items-center justify-center gap-2 py-1">
            <img 
              src="/logo.webp" 
              alt="Logo" 
              className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
            />
            <span className="text-xs text-gray-500">Created with Opencode by TheSmuz</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;