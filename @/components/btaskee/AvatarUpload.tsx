import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { InputProps } from '@/components/ui/input';
import { Input } from '@/components/ui/input';
import { toBase64 } from '@/lib/utils';
import { UploadCloud, User2Icon } from 'lucide-react';
import { useRef } from 'react';

type AvatarUploadProps = {
  value?: string;
  onChange?: (value?: string) => void;
};

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange: InputProps['onChange'] = async e => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      onChange?.(base64);
    }
  };

  return (
    <div className="w-40 h-40 text-center flex flex-col justify-center mt-10">
      <Avatar className="w-full h-full">
        <AvatarImage src={value} className="object-cover" />
        <AvatarFallback className="bg-secondary">
          <User2Icon className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>
      <Button
        variant="default"
        className="p-2 gap-2 mt-4"
        onClick={e => {
          e.preventDefault();
          inputRef.current?.click();
        }}>
        <UploadCloud className="w-4 h-4" />
        Upload
      </Button>
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
      />
    </div>
  );
}
