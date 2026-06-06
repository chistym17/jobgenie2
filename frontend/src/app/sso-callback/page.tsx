"use client";

import { HandleSSOCallback } from "@clerk/react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  return (
    <HandleSSOCallback
      navigateToApp={({ decorateUrl }) => {
        const destination = decorateUrl("/upload");
        if (destination.startsWith("http")) {
          window.location.href = destination;
          return;
        }
        router.push(destination);
      }}
      navigateToSignIn={() => {
        router.push("/sign-in");
      }}
      navigateToSignUp={() => {
        router.push("/sign-up");
      }}
    />
  );
}
