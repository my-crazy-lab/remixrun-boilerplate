import { Grid } from '@/components/btaskee/Grid';
import { Toaster } from '@/components/btaskee/ToasterBase';
import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import AccessDenied from '@/images/403.svg';
import NotFound from '@/images/404.svg';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { ClientLoaderFunctionArgs } from '@remix-run/react';
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
import i18next from '~/i18next.server';

import styles from './tailwind.css';
import type { MustBeAny } from './types';
import { AlertDialogProvider } from '@/components/btaskee/AlertDialogProvider';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await i18next.getLocale(request);
  return json({ locale });
};

interface DataCache {
  locale?: string;
}
const clientCache: DataCache = {};

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  if (clientCache.locale) {
    return { locale: clientCache.locale };
  }

  const dataServerLoader = await serverLoader<DataCache>();
  clientCache.locale = dataServerLoader?.locale;

  return { locale: clientCache.locale };
}
clientLoader.hydrate = true;

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: styles,
    },
  ];
};

export const handle = { i18n: 'common' };

export function ErrorBoundary() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const error: MustBeAny = useRouteError();

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
  const loaderData = useLoaderData<Required<DataCache>>();
  useChangeLanguage(loaderData.locale);

  return (
    <html lang={loaderData.locale}>
      <head>
        <title>bTaskee</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans">
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
