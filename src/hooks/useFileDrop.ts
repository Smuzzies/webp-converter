import { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';

interface FileDropEvent {
  paths: string[];
}

// Keep track of whether listener is already set up globally
let globalListenerSetup = false;
let globalUnlistenDrop: (() => void) | null = null;
let globalUnlistenDragOver: (() => void) | null = null;

export function useFileDrop(onFilesDropped: (paths: string[]) => void) {
  const callbackRef = useRef(onFilesDropped);
  
  // Update the ref when the callback changes
  useEffect(() => {
    callbackRef.current = onFilesDropped;
  }, [onFilesDropped]);

  useEffect(() => {
    const setupListener = async () => {
      // Only set up once globally
      if (globalListenerSetup) {
        console.log('File drop listener already set up, skipping');
        return;
      }
      
      globalListenerSetup = true;

      try {
        console.log('Setting up GLOBAL file drop listener...');
        
        // Clean up any existing listeners first
        if (globalUnlistenDrop) {
          globalUnlistenDrop();
          globalUnlistenDrop = null;
        }
        if (globalUnlistenDragOver) {
          globalUnlistenDragOver();
          globalUnlistenDragOver = null;
        }
        
        // Listen for file drop events
        globalUnlistenDrop = await listen('tauri://drag-drop', (event) => {
          console.log('File drop event received (single listener):', event);
          const payload = event.payload as FileDropEvent;
          
          if (payload.paths && payload.paths.length > 0) {
            // Filter for image files
            const imagePaths = payload.paths.filter(path => {
              const ext = path.toLowerCase().split('.').pop();
              return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'].includes(ext || '');
            });
            
            if (imagePaths.length > 0) {
              console.log('Calling onFilesDropped with:', imagePaths);
              // Use the ref to get the current callback
              callbackRef.current(imagePaths);
            }
          }
        });

        // Also listen for drag over event for visual feedback
        globalUnlistenDragOver = await listen('tauri://drag-over', () => {
          // Silent - just for visual feedback
        });
        
        console.log('GLOBAL file drop listener setup complete');
      } catch (error) {
        console.error('Error setting up file drop listener:', error);
        globalListenerSetup = false; // Reset on error
      }
    };

    setupListener();

    // Don't clean up on unmount since we want a global listener
    // This prevents multiple setups
  }, []); // Empty dependency array - only setup once
}