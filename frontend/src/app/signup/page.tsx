"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
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
      console.log(data);

      if (!res.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.access_token);
      toast.success("Account created successfully!");

      setTimeout(() => {
        router.push("/upload");
      }, 1000);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">Sign up to get started with our service</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 w-full rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 w-full rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
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
                  className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 w-full rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-medium rounded-lg py-3 px-4 flex items-center justify-center transition ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-3 text-sm text-gray-500">or continue with</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button className="flex items-center justify-center bg-black text-white rounded-lg p-2 hover:bg-gray-900 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.451 14.614c-.4 1.272-1.119 2.461-2.121 3.479-1 1.018-2.177 1.733-3.459 2.143-.655.182-1.394.364-2.201.364h-5.14c-.808 0-1.547-.182-2.201-.364-1.282-.41-2.459-1.125-3.459-2.143s-1.721-2.207-2.121-3.479c-.4-1.272-.6-2.634-.6-3.996s.2-2.724.6-3.996c.4-1.272 1.121-2.461 2.121-3.479 1-1.018 2.177-1.733 3.459-2.143.655-.182 1.394-.364 2.201-.364h5.14c.808 0 1.547.182 2.201.364 1.282.41 2.459 1.125 3.459 2.143s1.721 2.207 2.121 3.479c.4 1.272.6 2.634.6 3.996s-.2 2.724-.6 3.996zM16.865 4.723c-.887-.283-1.82-.424-2.865-.424h-4c-1.045 0-1.978.141-2.865.424-1.547.494-2.867 1.43-3.913 2.789-.522.678-.94 1.423-1.248 2.226-.309.803-.522 1.647-.641 2.544-.118.897-.118 1.804 0 2.701.119.897.332 1.741.641 2.544.308.803.726 1.548 1.248 2.226 1.046 1.359 2.366 2.295 3.913 2.789.887.283 1.82.424 2.865.424h4c1.045 0 1.978-.141 2.865-.424 1.547-.494 2.867-1.43 3.913-2.789.522-.678.94-1.423 1.248-2.226.309-.803.522-1.647.641-2.544.118-.897.118-1.804 0-2.701-.119-.897-.332-1.741-.641-2.544-.308-.803-.726-1.548-1.248-2.226-1.046-1.359-2.366-2.295-3.913-2.789zM16 12c0 .255-.073.511-.219.73-.146.219-.365.365-.584.438-.219.073-.438.073-.657 0-.219-.073-.438-.219-.584-.438l-1.336-1.336v3.212c0 .292-.109.547-.328.766-.219.219-.474.328-.766.328s-.547-.109-.766-.328c-.219-.219-.328-.474-.328-.766v-3.212l-1.336 1.336c-.146.219-.365.365-.584.438-.219.073-.438.073-.657 0-.219-.073-.438-.219-.584-.438-.146-.219-.219-.474-.219-.73s.073-.511.219-.73l2.994-2.994c.219-.219.474-.328.766-.328s.547.109.766.328l2.994 2.994c.146.219.219.474.219.73z" />
              </svg>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}