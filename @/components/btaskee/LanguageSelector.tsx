import { Form, FormField } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const FormSchema = z.object({
  language: z.string(),
});

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const { handleSubmit, control, setValue } = form;

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    i18n.changeLanguage(data.language);
  };

  const handleLanguageChange = (value: any) => {
    setValue('language', value);
    handleSubmit(onSubmit)();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <Select
              onValueChange={handleLanguageChange}
              defaultValue={field.value}>
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Vietnamese" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Vietnamese</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </form>
    </Form>
  );
}
