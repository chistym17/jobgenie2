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
      <label htmlFor={props.id || props.name} className="text-sm font-medium v2-text-muted">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 v2-text-muted" />
        </div>
        <input className={`v2-auth-input ${className}`} {...props} />
      </div>
      {error ? <p className="text-xs v2-error">{error}</p> : null}
    </div>
  );
};

export default AuthInput;
