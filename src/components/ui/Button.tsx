// components/ui/Button.tsx
import React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};
export default function Button({ loading, className = "", children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={[
        "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold",
        "bg-[#ff5722] text-white shadow-md transition",
        "hover:bg-[#e64a19] active:bg-[#d84315]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {loading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
