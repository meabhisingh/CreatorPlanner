"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import Link from "next/link";
import { useState } from "react";
import { SiGithub } from "react-icons/si";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        rememberMe: true,
        callbackURL: "/console",
      });

      if (error) throw new Error(error.message);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const githubSignIn = async () => {
    setLoading(true);

    try {
      const { error } = await signIn.social({
        provider: "github",
        callbackURL: "/console",
      });

      if (error) throw new Error(error.message);
    } catch (err) {
      setError("GitHub login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-red-500 to-indigo-600 w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-950 text-black dark:text-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <div className="flex items-center justify-center">{/* <Logo /> */}</div>
        <h2 className="text-2xl font-bold text-center ">Login</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block  font-medium">
              Email
            </label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block  font-medium">
              Password
            </label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center">OR</p>

        <Button
          onClick={githubSignIn}
          className="flex gap-2 items-center mx-auto w-full rounded-lg"
        >
          <SiGithub /> Continue with Github
        </Button>

        <p className="text-sm text-center text-gray-500">
          {"Don't have an account? "}
          <Link
            href="/sign-up"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
