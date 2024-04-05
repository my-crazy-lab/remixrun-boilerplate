import Typography from '@/components/btaskee/Typography';
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
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
} from '@remix-run/react';
import { HomeIcon } from 'lucide-react';
import { useChangeLanguage } from 'remix-i18next/react';
import i18next from '~/i18next.server';
import styles from './tailwind.css';

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

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          <CardHeader className="text-center">
            <CardTitle className="lg:text-7xl text-4xl">
              <img
                className="w-2/3 2xl:w-full text-center m-auto"
                src={NotFound}
                alt="not-found-img"
              />
            </CardTitle>
            <Typography className="mt-3" variant="h3">
              Sorry, page not found
            </Typography>
            <CardDescription>
              The page you are looking for not available!
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              className="gap-2"
              onClick={() => {
                navigate(-1);
              }}>
              <HomeIcon /> Go Back Home
            </Button>
          </CardFooter>
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
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Toaster />
        <LiveReload />
      </body>
    </html>
  );
}
