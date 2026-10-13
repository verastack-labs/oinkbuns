import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

/**
 * The devlog loader. Posts are Markdown files with front-matter under
 * content/devlog/, read at build time only (this module imports node:fs, so
 * it is used from Server Components and generateStaticParams, never from a
 * Client Component).
 *
 * Front-matter: title (string), date (YYYY-MM-DD, quoted or not), summary
 * (string), cover (site-absolute path, optional). The file name without .md
 * is the slug and must be lowercase letters, digits and hyphens, because it
 * becomes a folder name in the static export.
 */

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  cover: string | null;
}

export interface PostWithHtml extends Post {
  html: string;
}

export const CONTENT_DIR = join(process.cwd(), "content", "devlog");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(file: string, what: string): never {
  throw new Error(`devlog: ${file}: ${what}`);
}

function requiredText(
  data: Record<string, unknown>,
  key: "title" | "summary",
  file: string,
): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `front-matter "${key}" must be a non-empty string`);
  }
  return value.trim();
}

// YAML turns an unquoted 2026-10-12 into a Date at UTC midnight; a quoted one
// stays a string. Both come out as the same ten characters.
function isoDate(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && DATE.test(value)) {
    return value;
  }
  fail(file, 'front-matter "date" must be YYYY-MM-DD');
}

function coverPath(value: unknown, file: string): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value === "string" && value.startsWith("/")) {
    return value;
  }
  fail(file, 'front-matter "cover" must be a site-absolute path such as /art/peppa-happy.svg');
}

interface ParsedPost extends Post {
  body: string;
}

function parsePost(dir: string, file: string): ParsedPost {
  const slug = file.slice(0, -".md".length);
  if (!SLUG.test(slug)) {
    fail(file, "file name must be lowercase letters, digits and hyphens, plus .md");
  }
  const { data, content } = matter(readFileSync(join(dir, file), "utf8"));
  return {
    slug,
    title: requiredText(data, "title", file),
    date: isoDate(data.date, file),
    summary: requiredText(data, "summary", file),
    cover: coverPath(data.cover, file),
    body: content,
  };
}

function toPost(parsed: ParsedPost): Post {
  return {
    slug: parsed.slug,
    title: parsed.title,
    date: parsed.date,
    summary: parsed.summary,
    cover: parsed.cover,
  };
}

/** Every post in `dir`, newest first; same-day posts sort by slug. */
export function readPosts(dir: string): Post[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => toPost(parsePost(dir, file)))
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date < b.date ? 1 : -1;
      }
      return a.slug.localeCompare(b.slug);
    });
}

/** One post in `dir` with its body rendered to HTML. Throws for an unknown slug. */
export async function renderPost(dir: string, slug: string): Promise<PostWithHtml> {
  const file = `${slug}.md`;
  if (!SLUG.test(slug) || !existsSync(join(dir, file))) {
    throw new Error(`devlog: no post ${file} in ${dir}`);
  }
  const parsed = parsePost(dir, file);
  // remark-html sanitises by default (GitHub schema): raw HTML in a post is
  // dropped, standard Markdown output is kept. That is what we want.
  const rendered = await remark().use(remarkHtml).process(parsed.body);
  return { ...toPost(parsed), html: String(rendered) };
}

export function getAllPosts(): Post[] {
  return readPosts(CONTENT_DIR);
}

export function getPost(slug: string): Promise<PostWithHtml> {
  return renderPost(CONTENT_DIR, slug);
}
