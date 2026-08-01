"use client";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        checked
          ? "relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-primary p-0.5 transition-colors"
          : "relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-surface-container-highest p-0.5 transition-colors"
      }
    >
      <span
        className={
          checked
            ? "block h-5 w-5 translate-x-5 rounded-full bg-surface-container-lowest shadow-sm transition-transform"
            : "block h-5 w-5 translate-x-0 rounded-full bg-surface-container-lowest shadow-sm transition-transform"
        }
      />
    </button>
  );
}
