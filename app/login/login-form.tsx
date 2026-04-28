"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signInWithOtp, type LoginState } from "./actions";

const initialState: LoginState = { error: null, sent: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signInWithOtp, initialState);

  if (state.sent) {
    return (
      <div className="card-cut border border-white/10 bg-brand-surface p-6">
        <h2 className="text-lg">Check your email</h2>
        <p className="mt-2 text-sm tracking-wide text-white/60">
          We sent a magic link. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>
      {state.error ? <p className="text-sm text-brand-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
