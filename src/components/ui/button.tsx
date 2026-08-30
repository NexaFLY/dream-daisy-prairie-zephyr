import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-[0_0_0_1px_rgba(255,128,0,0.4)] hover:brightness-110",
        ghost:
          "bg-transparent text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.14)] hover:shadow-[0_0_0_1px_rgba(255,128,0,0.55)] hover:text-primary",
        subtle:
          "bg-surface text-fg shadow-[0_0_0_1px_rgba(244,236,223,0.08)] hover:shadow-[0_0_0_1px_rgba(255,128,0,0.4)]",
      },
      size: {
        md: "h-11 px-5 text-sm rounded-md",
        sm: "h-9 px-3.5 text-xs rounded-sm",
        lg: "h-12 px-6 text-[0.95rem] rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
