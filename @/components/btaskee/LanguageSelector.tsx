import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Form, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ERROR } from '~/constants/common';
import { getUserId } from '~/services/helpers.server';
import { setUserLanguage } from '~/services/settings.server';

const FormSchema = z.object({
  language: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const { language } = Object.fromEntries(formData);

    const userId = await getUserId({ request });

    if (language && typeof language === 'string') {
      await setUserLanguage({ language: language, userId });
    } else {
      throw new Error(ERROR.UNKNOWN_ERROR);
    }

    return json({ isSent: true });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message });
    }
    return json({ error: ERROR.UNKNOWN_ERROR });
  }
}

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleLanguageChange = (
    language: z.infer<typeof FormSchema>['language'],
  ) => {
    const formData = new FormData();
    formData.append('language', language);
    i18n.changeLanguage(language);
  };

  return (
    <Form {...form} method="post">
      <Select name="language" onValueChange={handleLanguageChange}>
        <SelectTrigger className="h-10 w-[180px]">
          <SelectValue placeholder="Vietnamese" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="vi">Vietnamese</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </Form>
  );
}
