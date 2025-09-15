export function useDownload() {
  const downloadBase64 = (base64Data: string, fileName: string) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/webp' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadAll = (images: Array<{ base64Data: string; fileName: string }>) => {
    images.forEach((image, index) => {
      setTimeout(() => {
        downloadBase64(image.base64Data, image.fileName);
      }, index * 200); // Stagger downloads to avoid browser blocking
    });
  };

  return { downloadBase64, downloadAll };
}