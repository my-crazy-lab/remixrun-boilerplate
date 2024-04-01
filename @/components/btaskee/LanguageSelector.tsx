import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from "react-i18next";

export const defaultLanguage = [
  {
    name: '🇺🇸 English',
    key: 'en',
  },
  {
    name: '🇻🇳 Vietnamese',
    key: 'vi',
  },
] as const;

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <Select
      defaultValue={`${defaultLanguage[0].key}`}
      onValueChange={value => changeLanguage(value)}>
      <SelectTrigger className="h-10 w-[180px]">
        <SelectValue placeholder={`${defaultLanguage[0].name}`} />
      </SelectTrigger>
      <SelectContent side="top">
        {defaultLanguage.map(lang => (
          <SelectItem key={lang.key} value={`${lang.key}`}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
