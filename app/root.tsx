import { Grid } from '@/components/btaskee/Grid';
import LoadingGlobal from '@/components/btaskee/LoadingGlobal';
import { Toaster } from '@/components/btaskee/ToasterBase';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import AccessDenied from '@/images/403.svg';
import NotFound from '@/images/404.svg';
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
} from '@remix-run/react';
import { HomeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next/react';
import { AlertDialogProvider } from '~/components/AlertDialogProvider';
import { type ErrorResponse, hocAction } from '~/hoc/remix';

import { getUserId, getUserSession } from './services/helpers.server';
import { setUserLanguage } from './services/settings.server';
import styles from './tailwind.css';

export const action = hocAction(async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData();
  const {
    language,
    name,
    redirect: redirectPath,
  } = Object.fromEntries(formData);

  if (name === 'changeLanguage' && typeof language === 'string') {
    const userId = await getUserId({ request });
    await setUserLanguage({ language, userId });

    return redirect(`${redirectPath}`);
  }

  return null;
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { language } = await getUserSession({ headers: request.headers });
  return json({ locale: language });
};

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
  ];
};

export const handle = { i18n: 'common' };

export function ErrorBoundary() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const error = useRouteError() as ErrorResponse;

  if (!error || !error.status || !error.statusText) {
    return null;
  }

  function renderContentBasedOnErrorStatus(status: number) {
    switch (status) {
      case 403:
        return (
          <Grid className="text-center">
            <div className="lg:text-7xl text-4xl">
              <img
                className="w-2/3 2xl:w-full text-center m-auto"
                src={AccessDenied}
                alt="access-denined-img"
              />
            </div>
            <Typography className="mt-3" variant="h3">
              {t('ACCESS_DENINED')}
            </Typography>
            <Typography variant="p" className="text-gray">
              {t('NOT_PERMISSION')}
            </Typography>
          </Grid>
        );
      default:
        return (
          <Grid className="text-center">
            <div className="lg:text-7xl text-4xl">
              <img
                className="w-2/3 2xl:w-full text-center m-auto"
                src={NotFound}
                alt="not-found-img"
              />
            </div>
            <Typography className="mt-3" variant="h3">
              {t('PAGE_NOT_FOUND')}
            </Typography>
            <Typography variant="p" className="text-gray">
              {t('PAGE_NOT_FOUND_DESCRIPTION')}
            </Typography>
          </Grid>
        );
    }
  }

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          {renderContentBasedOnErrorStatus(error.status)}
          <Button
            className="mt-10 gap-2 items-center"
            onClick={() => {
              navigate(-1);
            }}>
            <HomeIcon /> {t('GO_BACK')}
          </Button>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  useChangeLanguage(loaderData?.locale);

  return (
    <html lang={loaderData?.locale}>
      <head>
        <title>bTaskee</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans">
        <LoadingGlobal />
        <AlertDialogProvider>
          <Outlet />
        </AlertDialogProvider>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
        <LiveReload />
      </body>
    </html>
  );
}
