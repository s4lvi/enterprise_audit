import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { CheckItemForm } from "../../checklist/check-item-form";
import { deleteChapterCheckItem, updateChapterCheckItem } from "../actions";

export default async function EditChapterCheckItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: viewer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (viewer?.role !== "admin") notFound();

  const { data: item } = await supabase
    .from("chapter_check_items")
    .select("id, label, description, sort_order, archived")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  const remove = async () => {
    "use server";
    await deleteChapterCheckItem(id);
  };

  return (
    <main className="mx-auto mt-8 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
      <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
        Admin · chapter checklist
      </p>
      <h1 className="mb-6 text-3xl">{item.label}</h1>

      <CheckItemForm
        defaultValues={{
          label: item.label,
          description: item.description ?? "",
          sort_order: String(item.sort_order),
          archived: item.archived ? "on" : "",
        }}
        action={updateChapterCheckItem.bind(null, id)}
        submitLabel="Save changes"
      />

      <hr className="my-8 border-white/10" />
      <form action={remove}>
        <Button type="submit" variant="destructive" size="sm">
          Delete item
        </Button>
      </form>
    </main>
  );
}
