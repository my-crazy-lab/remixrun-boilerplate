import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      if (!(fileReader.result instanceof ArrayBuffer)) {
        resolve(fileReader.result || '');
      }
    };

    fileReader.onerror = error => {
      reject(error);
    };
  });
}
