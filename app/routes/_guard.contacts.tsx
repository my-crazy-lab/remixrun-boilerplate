import {
  Link,
  NavLink,
  Form,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type { LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { createEmptyContact, getContacts } from "../data";

import { Button } from "@/components/ui/button";
import { authenticator } from "~/services/auth.server";

export const action = async () => {
  console.log("action contacts");
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("loader contacts!");
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/sign-innnn",
  });

  return json({ contacts, q, user });
};

export default function App() {
  const { contacts, user, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  console.log(user);
  return (
    <>
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
                      isActive ? "active" : isPending ? "pending" : ""
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
                      {contact.favorite ? <span>★</span> : null}
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
        className={navigation.state === "loading" ? "loading" : ""}
      >
        <Outlet />
      </div>
    </>
  );
}
