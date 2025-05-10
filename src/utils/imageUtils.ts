
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
