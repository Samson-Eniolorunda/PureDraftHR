import { redirect } from "next/navigation";

/** Root page redirects to the Assistant tool */
export default function Home() {
  redirect("/assistant");
}
