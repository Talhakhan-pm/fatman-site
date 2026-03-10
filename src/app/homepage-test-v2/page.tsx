import { redirect } from "next/navigation";

/**
 * homepage-test-v2 is now the default homepage at `/`.
 * This route redirects to avoid duplicate content.
 */
export default function HomepageTestV2Redirect() {
  redirect("/");
}
