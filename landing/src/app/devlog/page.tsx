import type { Metadata } from "next";
import { DevlogList } from "@/components/devlog-list";
import { PlayPill } from "@/components/play-pill";
import { getAllPosts } from "@/lib/devlog";

export const metadata: Metadata = {
  title: "Devlog",
  description: "How Oinkbuns was made: who it is for, one button and a trackpad, and the first playtest.",
  alternates: { canonical: "/devlog/" },
};

export default function DevlogIndex() {
  return (
    <main className="flex flex-1 flex-col">
      <DevlogList posts={getAllPosts()} heading="Devlog" />
      <PlayPill />
    </main>
  );
}
