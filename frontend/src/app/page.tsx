import { redirect } from "next/navigation";

export default function HomePage() {
  // By default, send users to the login page.
  // The login page will handle redirecting them to their specific role dashboard if they are already authenticated.
  redirect("/login");
}
