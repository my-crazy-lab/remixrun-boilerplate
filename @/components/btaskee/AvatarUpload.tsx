import Typography from '@/components/btaskee/Typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import DefaultImage from '@/images/default-image.svg';
import { UploadIcon } from '@radix-ui/react-icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageUploadProps {
  onFileChange: (args: { file: File }) => void;
  description?: string;
  avatarUrl?: string;
  maxContentLength: number;
}

const AvatarUpload = ({
  onFileChange,
  description,
  avatarUrl,
  maxContentLength,
}: ImageUploadProps) => {
  const { t } = useTranslation('common');

  const [imagePreview, setImagePreview] = React.useState<
    string | ArrayBuffer | null
  >('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [fileInputRef]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Upload from device to browser
    const fileUploaded = event.target.files?.[0];

    if (!fileUploaded) return;
    if (fileUploaded.size > maxContentLength) {
      toast({
        description: t('ERROR_BY_MAX_FILE_SIZE'),
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      onFileChange({ file: fileUploaded }); // call the callback to notify the parent
    };
    reader.readAsDataURL(fileUploaded);
  };

  return (
    <div className=" items-center flex flex-col py-6 px-12 max-h-[448px] gap-4">
      {imagePreview && (
        <Typography affects="removePMargin" variant="p">
          {t('IMAGE_PREVIEW')}
        </Typography>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Avatar className="w-full h-full justify-center">
        <AvatarImage
          src={imagePreview || avatarUrl}
          className="object-cover w-40 h-40 rounded-full"
        />
        <AvatarFallback className="object-cover w-40 h-40 rounded-full">
          <img src={DefaultImage} alt="Default Avatar" />
        </AvatarFallback>
      </Avatar>
      <Typography
        className="text-center text-gray-400"
        variant="p"
        affects="removePMargin">
        {description}
      </Typography>
      <Button
        color="primary"
        className="items-center flex gap-2 rounded-md bg-white border-[1px] border-primary text-primary"
        variant="outline"
        type="button"
        onClick={handleButtonClick}>
        <UploadIcon className="h-4 w-4" />
        {t('UPLOAD')}
      </Button>
    </div>
  );
};

export default AvatarUpload;
