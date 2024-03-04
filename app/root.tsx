import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  ClientLoaderFunctionArgs,
} from "@remix-run/react";

import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import styles from "./tailwind.css";

import { Toaster } from "@/components/ui/toaster";

import { useChangeLanguage } from "remix-i18next/react";
import i18next from "~/i18next.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("loader server");
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

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);
  console.log(locale, "locale");

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
        <Toaster /> <LiveReload />
      </body>
    </html>
  );
}
