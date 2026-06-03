import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      tone: {
        default: "border-transparent bg-primary text-primary-foreground",
        muted: "border-border bg-muted text-muted-foreground",
        success:
          "border-transparent bg-success/15 text-success dark:text-success",
        warning:
          "border-transparent bg-warning/15 text-warning dark:text-warning",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:text-destructive",
        info: "border-transparent bg-info/15 text-info dark:text-info",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
