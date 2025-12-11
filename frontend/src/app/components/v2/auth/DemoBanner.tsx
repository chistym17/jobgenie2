import React from "react";
import { Loader2 } from "lucide-react";

interface DemoBannerProps {
  loading: boolean;
  onClick: () => void;
}

const DemoBanner = ({ loading, onClick }: DemoBannerProps) => {
  return (
    <div className="space-y-3 mb-6">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-black font-semibold rounded-lg py-3 px-4 shadow transition hover:opacity-90 border border-brand-secondary"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            Logging in as Demo User...
          </>
        ) : (
          <>Try the Demo Account</>
        )}
      </button>
      <p className="text-xs text-center text-brand-muted">
        Email: <span className="font-mono">demouser17@gmail.com</span> · Password: <span className="font-mono">1234567</span>
      </p>
    </div>
  );
};

export default DemoBanner;
