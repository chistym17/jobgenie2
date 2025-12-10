"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { Toaster, toast } from "sonner";

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
      }, 1000);
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
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600">Log in to your account to continue</p>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 px-4 mb-2 shadow transition focus:ring-2 focus:ring-green-400 focus:outline-none text-base border-2 border-green-600 animate-pulse"
            style={{ fontWeight: 700 }}
          >
            {demoLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Logging in as Demo User...
              </>
            ) : (
              <>
                Try the Demo Account
              </>
            )}
          </button>
          <p className="text-xs text-center text-green-700 mb-2 font-medium">
            Instantly explore the platform with the demo account!<br />
            <span className="font-mono">Email: demouser17@gmail.com</span> &nbsp;|&nbsp;
            <span className="font-mono">Password: 1234567</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 w-full rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <a href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 transition">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 w-full rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-medium rounded-lg py-3 px-4 flex items-center justify-center transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Logging in...
                </>
              ) : (
                <>
                  Log In
                  <LogIn className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}