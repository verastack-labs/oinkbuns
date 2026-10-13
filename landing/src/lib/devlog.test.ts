import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readPosts, renderPost } from "./devlog";

const GOOD = fileURLToPath(new URL("./__fixtures__/devlog/", import.meta.url));
const BAD = fileURLToPath(new URL("./__fixtures__/devlog-bad/", import.meta.url));
const BAD_SLUG = fileURLToPath(
  new URL("./__fixtures__/devlog-bad-slug/", import.meta.url),
);

describe("readPosts", () => {
  it("returns posts newest first with parsed front-matter", () => {
    const posts = readPosts(GOOD);
    expect(posts.map((p) => p.slug)).toEqual([
      "newest-post",
      "middle-post",
      "older-post",
    ]);
    expect(posts[0]).toEqual({
      slug: "newest-post",
      title: "The newest post",
      date: "2026-10-12",
      summary: "Newest.",
      cover: "/art/peppa-happy.svg",
    });
  });

  it("turns an unquoted YAML date into YYYY-MM-DD and a missing cover into null", () => {
    const middle = readPosts(GOOD).find((p) => p.slug === "middle-post");
    expect(middle?.date).toBe("2026-10-01");
    expect(middle?.cover).toBeNull();
  });

  it("names the file and the field when required front-matter is missing", () => {
    expect(() => readPosts(BAD)).toThrow(/no-title\.md: front-matter "title"/);
  });

  it("rejects a file name that is not a lowercase slug", () => {
    expect(() => readPosts(BAD_SLUG)).toThrow(/Bad Slug\.md: file name/);
  });
});

describe("renderPost", () => {
  it("renders the Markdown body to HTML and keeps the front-matter", async () => {
    const post = await renderPost(GOOD, "older-post");
    expect(post.title).toBe("The older post");
    expect(post.html).toContain("<h2>Heading</h2>");
    expect(post.html).toContain("<strong>bold</strong>");
    expect(post.html).toContain('href="/play/"');
  });

  it("rejects an unknown slug with a clear error", async () => {
    await expect(renderPost(GOOD, "nope")).rejects.toThrow(/no post nope\.md/);
  });
});
