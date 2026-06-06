import React from "react";
import { Loader2, PlayCircle } from "lucide-react";

interface DemoBannerProps {
  loading: boolean;
  onClick: () => void;
}

const DemoBanner = ({ loading, onClick }: DemoBannerProps) => {
  return (
    <div className="v2-auth-demo">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full v2-btn-outline flex items-center justify-center gap-2 font-medium py-2.5 px-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Signing in…
          </>
        ) : (
          <>
            <PlayCircle className="h-4 w-4" />
            Try demo account
          </>
        )}
      </button>
      <div className="v2-auth-demo-hint">
        <span className="v2-badge text-[10px] py-0.5">Demo</span>
        <code>demouser17@gmail.com</code>
        <span>·</span>
        <code>1234567</code>
      </div>
    </div>
  );
};

export default DemoBanner;
