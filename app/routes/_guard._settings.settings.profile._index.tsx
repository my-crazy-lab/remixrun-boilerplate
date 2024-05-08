import { useConfirm } from '@/components/btaskee/AlertDialogProvider';
import AvatarUpload from '@/components/btaskee/AvatarUpload';
import { Breadcrumbs, BreadcrumbsLink } from '@/components/btaskee/Breadcrumbs';
import { Grid } from '@/components/btaskee/Grid';
import Typography from '@/components/btaskee/Typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import {
  type LoaderFunctionArgs,
  type UploadHandler,
  json,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ACTION_NAME } from '~/constants/common';
import ROUTE_NAME from '~/constants/route';
import { hocAction } from '~/hoc/remix';
import { getUserId } from '~/services/helpers.server';
import { changeUserAvatar, getUserProfile } from '~/services/settings.server';
import type { ActionTypeWithError } from '~/types';
import { s3UploadHandler } from '~/utils/s3.server';

const MAXIMUM_CONTENT_LENGTH = 100 * 1024; //100kB
interface FormData {
  img: File | null;
}

export const handle = {
  breadcrumb: () => (
    <BreadcrumbsLink to={`${ROUTE_NAME.PROFILE_SETTING}`} label="PROFILE" />
  ),
  i18n: 'user-settings',
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId({ request });
  const userProfile = await getUserProfile(userId);

  return json({ userProfile });
};

export const action = hocAction(
  async ({ request }, { setInformationActionHistory }) => {
    const userId = await getUserId({ request });

    const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
      s3UploadHandler,
      unstable_createMemoryUploadHandler(),
    );

    const formData = await unstable_parseMultipartFormData(
      request.clone(),
      uploadHandler,
    );
    const imageUrl = formData.get('img')?.toString();

    await changeUserAvatar({ avatarUrl: imageUrl, userId });

    setInformationActionHistory({
      action: ACTION_NAME.UPDATE_USER_AVATAR,
    });

    return json({ success: true });
  },
);

export default function Screen() {
  const { t } = useTranslation('user-settings');

  const loaderData = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const confirm = useConfirm();
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const actionData = useActionData<ActionTypeWithError<typeof action>>();
  if (actionData?.error) {
    toast({ description: actionData.error });
  }
  if (actionData?.success) {
    toast({ variant: 'success', description: t('CHANGE_AVATAR_SUCCESSFUL') });
  }

  const { handleSubmit, setValue } = useForm<FormData>();

  const handleFileChange = (file: File | null) => {
    setValue('img', file);
  };

  async function onSubmit(data: FormData) {
    const formData = new FormData();

    if (data.img) formData.append('img', data.img);

    const isChangeAvatar = await confirm({
      title: t('CHANGE_AVATAR'),
      body: t('ARE_YOU_SURE_CHANGE_AVATAR'),
    });
    if (isChangeAvatar) {
      submit(formData, { method: 'post', encType: 'multipart/form-data' });
      setFileSelected(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col p-4 rounded-lg bg-secondary">
        <Typography variant="h3">{t('PROFILE')}</Typography>
        <Breadcrumbs />
      </div>

      <div className="gap-10 grid grid-cols-2">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('PERSONAL_DETAILS')}</CardTitle>
              <CardDescription>
                {t('PERSONAL_DETAILS_TEXT_HELPER')}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="py-4 flex flex-col gap-5">
              <Grid>
                <Typography variant="h3" affects="small">
                  {t('EMAIL')}
                </Typography>
                <Typography variant="h4" affects="small">
                  {loaderData.userProfile?.email}
                </Typography>
              </Grid>
              <Grid>
                <Typography variant="h3" affects="small">
                  {t('USERNAME')}
                </Typography>
                <Typography variant="h4" affects="small">
                  {loaderData.userProfile?.username}
                </Typography>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('AUTHORIZATION')}</CardTitle>
              <CardDescription>
                {t('PERSONAL_DETAILS_TEXT_HELPER')}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="mt-4 gap-4 grid">
              <Typography variant="h4" affects="small">
                {t('CITIES')}
              </Typography>
              <div className="gap-2 grid grid-cols-4">
                {loaderData.userProfile?.cities?.map((city, index) => {
                  return (
                    <Badge
                      className="text-center block rounded-md py-2 font-normal text-blue bg-blue-50"
                      key={index}>
                      {city}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="h-[448px]">
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle className="text-lg">{t('CHANGE_PROFILE')}</CardTitle>
                <CardDescription>
                  {t('CHANGE_PICTURE_FROM_HERE')}
                </CardDescription>
              </div>
              {fileSelected ? (
                <Button
                  type="submit"
                  disabled={fileSelected.size >= MAXIMUM_CONTENT_LENGTH}>
                  {t('CHANGE')}
                </Button>
              ) : null}
            </CardHeader>
            <Separator />
            <AvatarUpload
              onFileChange={({ file }) => {
                setFileSelected(file);
                handleFileChange(file);
              }}
              description={t('IMAGE_HELPER_TEXT')}
              avatarUrl={loaderData.userProfile?.avatarUrl}
              maxContentLength={MAXIMUM_CONTENT_LENGTH}
            />
          </form>
        </Card>
      </div>
    </div>
  );
}
