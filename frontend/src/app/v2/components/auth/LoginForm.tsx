"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { Toaster, toast } from "sonner";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";
import PrimaryButton from "./PrimaryButton";
import DemoBanner from "./DemoBanner";
import GoogleSignInButton from "../../../components/GoogleSignInButton";
import { safeRedirectPath } from "../../../utils/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.access_token);
      toast.success("Logged in successfully!");
      const dest = safeRedirectPath(nextPath);
      setTimeout(() => {
        router.push(dest);
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demouser17@gmail.com",
          password: "1234567",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Demo login failed");
      localStorage.setItem("token", data.access_token);
      toast.success("Logged in as Demo User!");
      const dest = safeRedirectPath(nextPath);
      setTimeout(() => {
        router.push(dest);
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  const signupHref = nextPath ? `/signup?next=${encodeURIComponent(nextPath)}` : "/signup";

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your Jobgenie journey">
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
      <DemoBanner loading={demoLoading} onClick={handleDemoLogin} />
      <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between text-sm v2-text-muted">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="v2-auth-checkbox h-4 w-4 rounded border" style={{ borderColor: "hsl(var(--border))" }} />
            Remember me
          </label>
          <Link href="/forgot-password" className="v2-link-accent">
            Forgot password?
          </Link>
        </div>
        <PrimaryButton type="submit" text="Log In" icon={<LogIn className="h-5 w-5" />} loading={loading} />
      </form>
      <div className="text-center pt-4 text-sm v2-text-muted">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="v2-link-accent">
          Sign up
        </Link>
      </div>
    </AuthShell>
  );
}
