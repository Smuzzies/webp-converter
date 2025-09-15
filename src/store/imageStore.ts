import { create } from 'zustand';
import { ImageFile, NamingOptions, ConversionResult } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { readFile } from '@tauri-apps/plugin-fs';

interface ImageState {
  images: ImageFile[];
  quality: number;
  namingOptions: NamingOptions;
  isConverting: boolean;
  progress: number;
  totalProgress: number;
  
  addImagePaths: (paths: string[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setQuality: (quality: number) => void;
  setNamingOptions: (options: NamingOptions) => void;
  convertImages: () => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
  images: [],
  quality: 85,
  namingOptions: {
    scheme: 'keep-original',
  },
  isConverting: false,
  progress: 0,
  totalProgress: 0,
  
  addImagePaths: async (paths: string[]) => {
    // Check for duplicates based on file path
    const existingPaths = get().images.map(img => img.filePath);
    const uniquePaths = paths.filter(path => !existingPaths.includes(path));
    
    if (uniquePaths.length === 0) {
      console.log('All files already added, skipping duplicates');
      return;
    }
    
    const newImages: ImageFile[] = [];
    
    for (const path of uniquePaths) {
      try {
        // Get file name from path
        const fileName = path.split(/[/\\]/).pop() || 'image';
        
        // Read file to get size and create blob URL for preview
        const fileData = await readFile(path);
        const blob = new Blob([fileData], { type: 'image/*' });
        const preview = URL.createObjectURL(blob);
        
        newImages.push({
          id: Math.random().toString(36).substring(2, 11),
          file: new File([fileData], fileName), // Create File object for compatibility
          filePath: path,
          preview,
          status: 'pending',
          originalSize: fileData.length,
        });
      } catch (error) {
        console.error(`Error loading image ${path}:`, error);
      }
    }
    
    if (newImages.length > 0) {
      set(state => ({ 
        images: [...state.images, ...newImages] 
      }));
      console.log(`Added ${newImages.length} new image(s)`);
    }
  },
  
  removeImage: (id: string) => {
    const image = get().images.find(img => img.id === id);
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    set(state => ({
      images: state.images.filter(img => img.id !== id)
    }));
  },
  
  clearImages: () => {
    const { images } = get();
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    set({ images: [], progress: 0, totalProgress: 0 });
  },
  
  setQuality: (quality: number) => {
    set({ quality });
  },
  
  setNamingOptions: (options: NamingOptions) => {
    set({ namingOptions: options });
  },
  
  convertImages: async () => {
    const { images, quality, namingOptions } = get();
    const pendingImages = images.filter(img => img.status === 'pending');
    
    if (pendingImages.length === 0) return;
    
    set({ isConverting: true, progress: 0, totalProgress: pendingImages.length });
    
    try {
      for (let i = 0; i < pendingImages.length; i++) {
        const image = pendingImages[i];
        
        // Update status to converting
        set(state => ({
          images: state.images.map(img => 
            img.id === image.id 
              ? { ...img, status: 'converting' as const } 
              : img
          ),
        }));
        
        try {
          // Use the file path directly if available
          if (image.filePath) {
            // Call the Rust function that reads file from disk and converts
            const result = await invoke<ConversionResult>('convert_and_save_webp', {
              sourcePath: image.filePath,
              quality: quality / 100,
              namingOptions,
            });
            
            console.log('Conversion result:', result);
            
            // Update with result
            set(state => ({
              images: state.images.map(img => 
                img.id === image.id 
                  ? { 
                      ...img, 
                      status: result.success ? 'completed' as const : 'error' as const,
                      outputPath: result.outputPath,
                      compressedSize: result.newSize,
                      error: result.error,
                      base64Data: result.base64Data,
                    } 
                  : img
              ),
              progress: i + 1,
            }));
          }
        } catch (error) {
          console.error(`Error converting ${image.file.name}:`, error);
          
          // Update with error
          set(state => ({
            images: state.images.map(img => 
              img.id === image.id 
                ? { 
                    ...img, 
                    status: 'error' as const,
                    error: error instanceof Error ? error.message : 'Conversion failed',
                  } 
                : img
            ),
            progress: i + 1,
          }));
        }
      }
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      set({ isConverting: false });
    }
  },
}))