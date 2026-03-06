import { permanentRedirect } from "next/navigation";

/** Root page permanently redirects to the Assistant tool (308 for SEO) */
export default function Home() {
  permanentRedirect("/assistant");
}
