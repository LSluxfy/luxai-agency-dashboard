
/**
 * Converts a File object to a data URI
 */
export const convertFileToDataUri = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao converter arquivo para Data URI'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    reader.readAsDataURL(file);
  });
};
