import Image from "next/image";

import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto mt-24 max-w-sm px-6">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/logo.svg" alt="ACP" width={48} height={40} className="h-10 w-auto" priority />
        <div>
          <p className="text-[10px] font-bold tracking-widest text-brand-primary uppercase">
            Sign in
          </p>
          <h1 className="text-2xl">Enterprise Audit</h1>
        </div>
      </div>
      <LoginForm next={next} />
    </main>
  );
}
