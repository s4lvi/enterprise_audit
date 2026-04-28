"use client";

import { useActionState } from "react";

import { signInWithOtp, type LoginState } from "./actions";

const initialState: LoginState = { error: null, sent: false };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signInWithOtp, initialState);

  if (state.sent) {
    return (
      <div className="rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">We sent a magic link. Click it to sign in.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="block">
        <span className="block text-sm font-medium">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
