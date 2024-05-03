import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation, useSubmit } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { defaultLanguage } from '~/constants/common';

export default function LanguageSelector({
  userLanguage = defaultLanguage,
}: {
  userLanguage: string | undefined;
}) {
  const { i18n } = useTranslation();
  const submit = useSubmit();

  const location = useLocation();

  const onSubmit = (language: string) => {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('name', 'changeLanguage');
    formData.append('redirect', location.pathname);

    i18n.changeLanguage(language);
    submit(formData, {
      method: 'post',
      action: '/',
    });
  };

  return (
    <Select defaultValue={userLanguage} onValueChange={onSubmit}>
      <SelectTrigger className="h-10 w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vi">Vietnamese</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
