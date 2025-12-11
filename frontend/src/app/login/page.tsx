"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn } from "lucide-react";
import { Toaster, toast } from "sonner";
import AuthShell from "../components/v2/auth/AuthShell";
import AuthInput from "../components/v2/auth/AuthInput";
import PrimaryButton from "../components/v2/auth/PrimaryButton";
import DemoBanner from "../components/v2/auth/DemoBanner";

export default function LoginPage() {
  const router = useRouter();
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
      setTimeout(() => {
        router.push("/upload");
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
      setTimeout(() => {
        router.push("/upload");
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your Jobgenie journey">
      <Toaster position="top-center" richColors />
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
        <div className="flex items-center justify-between text-sm text-brand-muted">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded border-brand-border bg-transparent text-brand-primary focus:ring-brand-primary" />
            Remember me
          </label>
          <a href="/forgot-password" className="text-brand-primary hover:opacity-80">Forgot password?</a>
        </div>
        <PrimaryButton type="submit" text="Log In" icon={<LogIn className="h-5 w-5" />} loading={loading} />
      </form>
      <div className="text-center pt-4 text-sm text-brand-muted">
        Don't have an account? <a href="/signup" className="text-brand-primary hover:opacity-80 font-semibold">Sign up</a>
      </div>
    </AuthShell>
  );
}
