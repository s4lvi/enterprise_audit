import { createChapter } from "../actions";
import { ChapterForm } from "../chapter-form";

export default function NewChapterPage() {
  return (
    <main className="mx-auto mt-8 max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">New chapter</h1>
      <ChapterForm action={createChapter} submitLabel="Create chapter" />
    </main>
  );
}
