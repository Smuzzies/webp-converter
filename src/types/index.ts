export interface ImageFile {
  id: string;
  file: File;
  filePath?: string;
  preview: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  outputPath?: string;
  originalSize: number;
  compressedSize?: number;
  error?: string;
  base64Data?: string;
}

export type NamingScheme = 'keep-original' | 'add-suffix' | 'custom';

export interface NamingOptions {
  scheme: NamingScheme;
  suffix?: string;
  customPattern?: string;
}

export interface ConversionResult {
  success: boolean;
  outputPath: string;
  originalSize: number;
  newSize: number;
  error?: string;
  base64Data?: string;
}