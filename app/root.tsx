import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  ClientLoaderFunctionArgs,
  useRouteError,
} from "@remix-run/react";
import { Toaster } from "@/components/ui/toaster";

import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import styles from "./tailwind.css";
import { useChangeLanguage } from "remix-i18next/react";
import i18next from "~/i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Add data get one time as Services, Users profile,... at here

  const locale = await i18next.getLocale(request);

  return json({ locale });
};

let clientCache: {
  locale?: string;
} = {};
export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  console.log("loader client");
  if (clientCache.locale) {
    return { locale: clientCache.locale };
  }

  const dataServerLoader: any = await serverLoader();
  clientCache.locale = dataServerLoader?.locale;

  return { locale: clientCache.locale };
}
clientLoader.hydrate = true;

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const handle = { i18n: "common" };

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <>Error page</>
        {/* add the UI you want your users to see */}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);

  return (
    <html lang={locale}>
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
