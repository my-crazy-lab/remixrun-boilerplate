import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
} from "@remix-run/react";

import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import styles from "./tailwind.css";

import { Toaster } from "@/components/ui/toaster";

import { useChangeLanguage } from "remix-i18next/react";
import i18next from "~/i18next.server";
import { authenticator } from "./services/auth.server";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const { _action } = Object.fromEntries(formData);
  if (_action === "logout") {
    await authenticator.logout(request, { redirectTo: "/sign-in" });
  }
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await i18next.getLocale(request);

  return json({ locale });
};

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
