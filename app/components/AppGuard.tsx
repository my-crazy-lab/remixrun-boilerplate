import { LoaderFunctionArgs, json } from "@remix-run/node";
import { PropsWithChildren } from "react";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("load guard");
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/sign-in",
  });

  return json({ user });
};

export default function App({ children }: PropsWithChildren<any>) {
  return <>{children}</>;
}
