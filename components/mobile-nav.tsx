"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type NavItem = { href: string; label: string };

type Props = {
  items: NavItem[];
  isAdmin: boolean;
  displayName: string;
  role: string;
};

export function MobileNav({ items, isAdmin, displayName, role }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // createPortal needs a DOM target; mark mounted on the client.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Auto-close when route changes (after a link click). pathname is the
  // external system we're syncing with — eslint's set-state-in-effect
  // rule doesn't account for that case.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const panel = open ? (
    <div
      className="fixed inset-0 md:hidden"
      style={{ backgroundColor: "#0a0a0a", zIndex: 100 }}
      onClick={() => setOpen(false)}
    >
      {/* Top accent bars */}
      <div className="top-bars">
        <span />
        <span />
        <span />
      </div>
      {/* Header row inside the panel: brand + close button */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-sm font-black tracking-[0.2em] uppercase">
          Enterprise <span className="text-brand-primary">DB</span>
        </span>
        <button
          type="button"
          aria-label="Close menu"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
          className="btn-cut inline-flex items-center justify-center bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav
        className="flex h-[calc(100dvh-3.25rem)] flex-col px-6 pt-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="flex-1 space-y-3">
          {items.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="block py-2 text-lg font-black tracking-[0.2em] text-white uppercase hover:text-brand-primary"
              >
                {n.label}
              </Link>
            </li>
          ))}
          {isAdmin ? (
            <li>
              <Link
                href="/admin"
                className="block py-2 text-lg font-black tracking-[0.2em] text-white uppercase hover:text-brand-primary"
              >
                Admin
              </Link>
            </li>
          ) : null}
        </ul>
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href="/profile"
            className="block py-1 text-xs uppercase tracking-widest text-white/60"
          >
            {displayName}
            <span className="mx-2 text-white/20">·</span>
            <span className="text-white/80">{role}</span>
          </Link>
          <form action="/logout" method="post" className="mt-3">
            <button
              type="submit"
              className="btn-cut w-full bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/20"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="btn-cut inline-flex items-center justify-center bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20 md:hidden"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
