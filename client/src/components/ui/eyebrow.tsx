import * as React from "react";
import { cn } from "@/lib/utils";

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Eyebrow({
  icon,
  children,
  className,
  ...props
}: EyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-muted/90 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 shadow-xs",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="tracking-tight">{children}</span>
    </div>
  );
}
