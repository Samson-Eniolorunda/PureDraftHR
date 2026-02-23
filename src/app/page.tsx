import { redirect } from "next/navigation";

/** Root page redirects to the Formatter tool */
export default function Home() {
  redirect("/formatter");
}
