"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import AuthShell from "../components/v2/auth/AuthShell";
import AuthInput from "../components/v2/auth/AuthInput";
import PrimaryButton from "../components/v2/auth/PrimaryButton";
import { safeRedirectPath } from "../utils/auth";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.access_token);
      toast.success("Account created successfully!");

      const dest = safeRedirectPath(nextPath);
      setTimeout(() => {
        router.push(dest);
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <AuthShell title="Join Jobgenie" subtitle="Create an account to get curated matches and guidance">
      <Toaster position="top-center" richColors />
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="name"
          name="name"
          type="text"
          required
          label="Full Name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          icon={User}
          autoComplete="name"
        />
        <AuthInput
          id="email"
          name="email"
          type="email"
          required
          label="Email Address"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={Mail}
          autoComplete="email"
        />
        <AuthInput
          id="password"
          name="password"
          type="password"
          required
          label="Password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          icon={Lock}
          autoComplete="new-password"
        />
        <PrimaryButton type="submit" text="Create Account" icon={<ArrowRight className="h-5 w-5" />} loading={loading} />
      </form>
      <div className="text-center pt-4 text-sm text-brand-muted">
        Already have an account?{" "}
        <a href={loginHref} className="text-brand-primary hover:opacity-80 font-semibold">
          Log in
        </a>
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Join Jobgenie" subtitle="Create an account to get curated matches and guidance">
          <div className="flex justify-center py-12 text-brand-muted">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        </AuthShell>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
