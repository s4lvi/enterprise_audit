import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Brand-styled buttons: angular left edge (clip-path), uppercase, wide
 * tracking, font-black. Variants map onto our brand palette.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center font-black uppercase tracking-widest whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-cut bg-primary text-white hover:brightness-125",
        accent: "btn-cut bg-accent text-black hover:brightness-110",
        outline: "btn-cut border border-white/30 text-white hover:bg-white/10",
        secondary: "btn-cut bg-white/10 text-white hover:bg-white/20",
        ghost: "text-white/60 hover:bg-white/5 hover:text-white",
        destructive: "btn-cut bg-brand-danger text-white hover:brightness-125",
        link: "text-brand-primary hover:underline",
      },
      size: {
        default: "h-9 px-5 py-2 text-xs",
        xs: "h-7 px-3 text-[10px]",
        sm: "h-8 px-3.5 text-[11px]",
        lg: "h-11 px-7 py-3 text-sm",
        icon: "size-9 px-0",
        "icon-xs": "size-7 px-0",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
