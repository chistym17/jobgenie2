import React from "react";
import { LucideIcon } from "lucide-react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

const AuthInput = ({ label, icon: Icon, error, className = "", ...props }: AuthInputProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={props.id || props.name} className="text-sm font-medium text-brand-muted">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-brand-muted" />
        </div>
        <input
          className={`w-full rounded-lg bg-[#0f141a] border border-brand-border text-white pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition placeholder:text-brand-muted/70 ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
};

export default AuthInput;
