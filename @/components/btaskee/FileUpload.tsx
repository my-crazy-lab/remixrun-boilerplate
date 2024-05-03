import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DefaultImage from '@/images/default-image.svg';
import { UploadCloud } from 'lucide-react';
import React from 'react';

interface ImageUploadProps {
  onFileChange: (
    file: File | null,
    previewUrl: string | null,
    fileName: string,
  ) => void;
  title?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileChange, title }) => {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setImagePreview(preview);
        onFileChange(file, preview, file.name); // Call the callback to notify the parent
      };

      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      onFileChange(null, null, ''); // Reset the callback if no file is selected
    }
  };

  return (
    <Card className="border-dashed items-center flex flex-col py-6 px-12 max-h-[448px] gap-4">
      <Typography>{title}</Typography>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {imagePreview ? (
        <img src={imagePreview} alt="Image Preview" />
      ) : (
        <img src={DefaultImage} alt="Default Image" />
      )}
      <Typography
        className="text-center text-gray-400"
        variant="p"
        affects="removePMargin">
        Image should be more than 5kb and less than 64kb
        <br />
        Aspect ratio (2:1)
      </Typography>
      <Button
        color="primary"
        className="items-center flex gap-2 rounded-lg text-"
        variant="outline"
        type="button"
        onClick={handleButtonClick}>
        <UploadCloud className="h-4 w-4" />
        Upload
      </Button>
    </Card>
  );
};

export default ImageUpload;
