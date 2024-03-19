import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
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
  const routerError = useRouteError();

  console.log(routerError);

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex items-center justify-center h-screen bg-slate-300">
          <Card className="w-[420px]">
            <CardHeader className="text-center">
              <CardTitle className="lg:text-7xl text-4xl">404</CardTitle>
              <CardDescription>
                The page you’re looking for doesn’t exist.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => {
                  navigate(-1);
                }}>
                Go Back
              </Button>
            </CardFooter>
          </Card>
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
