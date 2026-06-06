"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, User, Lock, ArrowRight } from "lucide-react";
import { Toaster, toast } from "sonner";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";
import PrimaryButton from "./PrimaryButton";
import GoogleSignInButton from "../../../components/GoogleSignInButton";
import { safeRedirectPath } from "../../../utils/auth";

export default function SignupForm() {
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

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <AuthShell title="Join Jobgenie" subtitle="Create an account to get curated matches and guidance">
      <Toaster position="top-center" richColors />
      <GoogleSignInButton redirectPath={nextPath} className="v2-google-btn" />
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full v2-auth-divider" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-2 v2-text-muted" style={{ background: "hsl(var(--card))" }}>
            or
          </span>
        </div>
      </div>
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
      <div className="text-center pt-4 text-sm v2-text-muted">
        Already have an account?{" "}
        <Link href={loginHref} className="v2-link-accent">
          Log in
        </Link>
      </div>
    </AuthShell>
  );
}
