"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import V2Toaster from "../V2Toaster";
import AuthShell, { AuthDivider } from "./AuthShell";
import AuthInput from "./AuthInput";
import PrimaryButton from "./PrimaryButton";
import DemoBanner from "./DemoBanner";
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
    <AuthShell title="Welcome back" subtitle="Sign in to view your matches and match coach">
      <V2Toaster />
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="email"
          name="email"
          type="email"
          required
          label="Email"
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
        <div className="flex items-center justify-between gap-3 text-sm v2-text-muted">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="v2-auth-checkbox h-4 w-4 rounded border" style={{ borderColor: "hsl(var(--border))" }} />
            Remember me
          </label>
          <Link href="/forgot-password" className="v2-link-accent shrink-0">
            Forgot password?
          </Link>
        </div>
        <PrimaryButton type="submit" text="Log in" icon={<LogIn className="h-5 w-5" />} loading={loading} />
      </form>
      <AuthDivider label="or explore first" />
      <DemoBanner loading={demoLoading} onClick={handleDemoLogin} />
      <div className="v2-auth-footer">
        Don&apos;t have an account?{" "}
        <Link href={signupHref} className="v2-link-accent">
          Sign up
        </Link>
      </div>
    </AuthShell>
  );
}
