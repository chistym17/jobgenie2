"use client";

import { Toaster } from "sonner";

export default function V2Toaster() {
  return (
    <Toaster
      position="top-center"
      className="v2-toaster"
      theme="dark"
      closeButton
      toastOptions={{
        classNames: {
          toast: "v2-toast",
          title: "v2-toast-title",
          description: "v2-toast-description",
          actionButton: "v2-toast-action",
          cancelButton: "v2-toast-cancel",
          closeButton: "v2-toast-close",
          success: "v2-toast-success",
          error: "v2-toast-error",
          warning: "v2-toast-warning",
          info: "v2-toast-info",
          loading: "v2-toast-loading",
        },
      }}
    />
  );
}
