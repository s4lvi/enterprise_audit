"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RELATIONSHIP_TYPES, type RelationshipType } from "@/lib/schemas/relationship";

import { createRelationship, deleteRelationship } from "@/app/relationships/actions";

export type RelationshipRow = {
  id: string;
  type: RelationshipType;
  notes: string | null;
  /** Whether the current enterprise is the from_id (true) or to_id (false). */
  outgoing: boolean;
  other: { id: string; name: string };
};

type Props = {
  enterpriseId: string;
  enterpriseOptions: Array<{ id: string; name: string }>;
  relationships: RelationshipRow[];
  /** Whether to show add/delete UI. */
  canEdit: boolean;
};

export function RelationshipsSection({
  enterpriseId,
  enterpriseOptions,
  relationships,
  canEdit,
}: Props) {
  const otherEnterprises = enterpriseOptions.filter((e) => e.id !== enterpriseId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [toId, setToId] = useState<string>("");
  const [type, setType] = useState<RelationshipType>("partner");
  const [notes, setNotes] = useState<string>("");

  const onAdd = () => {
    setError(null);
    startTransition(async () => {
      const result = await createRelationship({
        from_id: enterpriseId,
        to_id: toId,
        type,
        notes,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setToId("");
        setType("partner");
        setNotes("");
      }
    });
  };

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">Relationships</h2>

      {relationships.length === 0 ? (
        <p className="mb-4 text-sm text-white/60">No relationships yet.</p>
      ) : (
        <ul className="mb-4 space-y-2 text-sm">
          {relationships.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded border border-white/10 p-2"
            >
              <div className="space-y-0.5">
                <div>
                  <span className="text-white/50">{r.outgoing ? "→ " : "← "}</span>
                  <Link href={`/enterprises/${r.other.id}`} className="font-medium hover:underline">
                    {r.other.name}
                  </Link>
                  <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">
                    {r.type}
                  </span>
                </div>
                {r.notes ? <div className="text-xs text-white/50">{r.notes}</div> : null}
              </div>
              {canEdit ? <DeleteRelationshipButton id={r.id} /> : null}
            </li>
          ))}
        </ul>
      )}

      {canEdit ? (
        <div className="rounded border border-white/10 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
            Add relationship
          </p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target enterprise</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {otherEnterprises.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as RelationshipType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context, terms, etc."
              />
            </div>
            {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
            <Button type="button" disabled={isPending || !toId} onClick={onAdd} size="sm">
              {isPending ? "Adding…" : "Add relationship"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DeleteRelationshipButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("Remove this relationship?")) return;
        startTransition(async () => {
          await deleteRelationship(id);
        });
      }}
    >
      {isPending ? "…" : "Remove"}
    </Button>
  );
}
