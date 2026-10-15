import { cn } from "~/lib/utils";

/** Red/white DIN 30710 warning stripes, as on the rear of German fire engines. */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-7 shrink-0 rounded-[3px]", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, hsl(var(--feuerrot)) 0 5px, hsl(42 21% 94%) 5px 10px)",
      }}
    />
  );
}
