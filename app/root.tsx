import {
  Link,
  NavLink,
  Form,
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type { LoaderFunctionArgs,LinksFunction } from "@remix-run/node";
import appStylesHref from "./app.css";

import { json, redirect } from "@remix-run/node";
import { createEmptyContact, getContacts } from "./data";

export const action = async () => { 
  const contact = await createEmptyContact(); 
 return redirect(`/contacts/${contact.id}/edit`);
}; 

export const loader = async ({request}:LoaderFunctionArgs) => { 
const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);

  return json({ contacts, q });
  };

export const links: LinksFunction=()=>{
  return [
  {
    rel: "stylesheet",
    href: appStylesHref
  }
  ]
}

export default function App() {
  const { contacts, q} = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                defaultValue={q || ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
{contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                  <NavLink
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "active"
                      : isPending
                      ? "pending"
                      : ""
                  }
                  to={`contacts/${contact.id}`}
                >
                <Link to={`contacts/${contact.id}`}>
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{" "}
                  {contact.favorite ? (
                    <span>★</span>
                  ) : null}
                </Link>
                </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
<div 
id="detail" 
className={ navigation.state === "loading" ? "loading" : ""        }
          >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
