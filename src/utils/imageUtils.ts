import { VALID_DIMENSIONS } from "@/components/creative-studio/stable-diffusion/sdConstants";

/**
 * Converts a File object to a data URI
 */
export const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Data URI'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Finds the closest valid dimension for a given width and height
 * based on the model being used (SDXL or SD 1.6)
 */
export const findClosestValidDimension = (width: number, height: number, useSdxl: boolean): string => {
  // Filter dimensions based on model
  const validDimensionsForModel = VALID_DIMENSIONS.filter(dim => useSdxl ? dim.sdxl : true);
  
  // Calculate aspect ratio of the input image
  const inputRatio = width / height;
  
  // Find the closest match by aspect ratio and total pixels
  let closestDimension = validDimensionsForModel[0].value;
  let minDifference = Infinity;
  
  for (const dim of validDimensionsForModel) {
    const [dimWidth, dimHeight] = dim.value.split('x').map(Number);
    const dimRatio = dimWidth / dimHeight;
    
    // Calculate difference in aspect ratio and total pixels
    const ratioDiff = Math.abs(dimRatio - inputRatio);
    const pixelDiff = Math.abs((dimWidth * dimHeight) - (width * height));
    
    // Combined score (weighted more towards aspect ratio)
    const score = ratioDiff * 10 + pixelDiff / 100000;
    
    if (score < minDifference) {
      minDifference = score;
      closestDimension = dim.value;
    }
  }
  
  return closestDimension;
};

/**
 * Resizes an image data URI to the nearest valid dimension for the model
 */
export const resizeImageToNearestValidDimension = async (
  dataUri: string, 
  useSdxl: boolean
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Find the closest valid dimension
      const closestDim = findClosestValidDimension(img.width, img.height, useSdxl);
      const [targetWidth, targetHeight] = closestDim.split('x').map(Number);
      
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw the image onto the canvas with the new dimensions
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use better quality image resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image centered on the canvas, preserving aspect ratio
      const scale = Math.min(
        targetWidth / img.width,
        targetHeight / img.height
      );
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;
      
      // Fill with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      // Convert back to data URI
      const resizedDataUri = canvas.toDataURL('image/jpeg', 0.92);
      resolve(resizedDataUri);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = dataUri;
  });
};

// New utility functions for mask and control images processing
export async function processStabilityImage(
  imageData: string, 
  isSDXL: boolean = true,
  purpose: 'reference' | 'mask' | 'control' = 'reference'
): Promise<string> {
  // For different purposes we might want different processing
  switch (purpose) {
    case 'mask':
      // For masks, we want to ensure they're properly binarized
      return convertToBlackAndWhiteMask(
        await resizeImageToNearestValidDimension(imageData, isSDXL)
      );
    case 'control':
      // For control images, specific preprocessing might be needed based on mode
      // For now, just resize to valid dimensions
      return resizeImageToNearestValidDimension(imageData, isSDXL);
    case 'reference':
    default:
      // Standard processing for reference images
      return resizeImageToNearestValidDimension(imageData, isSDXL);
  }
}

// Function to convert an image to a black and white mask
async function convertToBlackAndWhiteMask(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get the image data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Convert to black and white with threshold
      for (let i = 0; i < data.length; i += 4) {
        // Calculate luminance
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply threshold (128 is middle of 0-255 range)
        const value = luminance > 128 ? 255 : 0;
        
        // Set RGB to the same value for black or white
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        // Keep alpha channel as is
      }
      
      // Put the modified image data back on the canvas
      ctx.putImageData(imgData, 0, 0);
      
      // Get the black and white image as data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for mask processing'));
    };
    
    img.src = imageData;
  });
}
