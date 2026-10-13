import { getAllPosts } from "@/lib/devlog";
import { DESCRIPTION, DISCLAIMER, FAQS, REPO_URL, SITE_NAME, SITE_URL } from "@/lib/site";

// A plain-text summary for AI assistants (the llms.txt convention), written
// at build time from the same facts as the page.
export const dynamic = "force-static";

export function GET(): Response {
  const posts = getAllPosts();
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${DESCRIPTION}`,
    "",
    "A free browser game for children aged about 7 to 8. No ads, no accounts, no tracking, nothing to install.",
    "",
    "## Links",
    "",
    `- [Play the game](${SITE_URL}/play/): runs in any modern browser on laptop, tablet or phone`,
    `- [Home page](${SITE_URL}/): how to play, the customers and the five days`,
    `- [Devlog](${SITE_URL}/devlog/): notes on how the game is made`,
    `- [Source code](${REPO_URL})`,
    "",
    "## Devlog posts",
    "",
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/devlog/${p.slug}/): ${p.summary}`),
    "",
    "## FAQ",
    "",
    ...FAQS.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Notice",
    "",
    DISCLAIMER,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
