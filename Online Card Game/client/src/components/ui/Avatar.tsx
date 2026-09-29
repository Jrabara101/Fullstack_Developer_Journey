import * as React from "react";
import { cn } from "../../lib/utils.js";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback = "P",
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl font-bold"
  }[size];

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border-2 border-slate-700 select-none shadow-md",
        sizeClasses,
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-bold text-slate-300 uppercase tracking-tight">
          {fallback.slice(0, 2)}
        </span>
      )}
    </div>
  );
}
