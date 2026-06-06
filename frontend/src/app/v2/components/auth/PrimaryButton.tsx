import React from "react";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  text: string;
  icon?: React.ReactNode;
}

const PrimaryButton = ({ loading, text, icon, className = "", ...props }: PrimaryButtonProps) => {
  return (
    <button
      className={`w-full v2-btn-primary text-sm font-semibold py-3 px-4 flex items-center justify-center gap-2 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      <span>{loading ? "Please wait" : text}</span>
    </button>
  );
};

export default PrimaryButton;
