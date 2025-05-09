import { cn } from "../utils/cn";

export const SPINNER_SM_CLASSNAMES =
  "h-4 w-4 border-2 border-solid border-white" as const;
export const SPINNER_LG_CLASSNAMES =
  "h-16 w-16 border-4 border-solid border-white" as const;

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        className,
        "animate-spin-fast rounded-full border-t-transparent"
      )}
    />
  );
}
