"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft
} from "lucide-react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleAuth = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${window.location.origin}/auth/callback/google&response_type=token&scope=email profile`;
  };

  const handleMicrosoftAuth = () => {
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&response_type=token&redirect_uri=${window.location.origin}/auth/callback/microsoft&scope=openid profile email`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      if (data.user?.role === "ADMIN") {
        router.push("/ops");
      } else if (data.user?.role === "PRO") {
        router.push("/dashboard");
      } else {
        router.push("/client/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen flex flex-col">
      <NexaNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexa-brand/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexa-accent/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <NexaCard variant="glass" className="p-8 md:p-10 shadow-2xl border-nexa-border/50">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-display mb-2 leading-none">Welcome Back</h1>
              <p className="text-nexa-text-secondary text-sm">Log in to manage your bookings and orders.</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}
              <NexaInput
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={loading}
              />
              
              <div className="space-y-1">
                <NexaInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  disabled={loading}
                />
                <div className="text-right">
                  <Link href="#" className="text-xs font-bold text-nexa-brand hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <NexaButton 
                size="lg" 
                type="submit"
                isLoading={loading}
                className="w-full h-14 rounded-2xl shadow-xl shadow-nexa-brand/20 font-extrabold text-lg" 
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Sign In
              </NexaButton>
            </form>

            <div className="mt-10 mb-8 flex items-center gap-4">
              <div className="h-px bg-nexa-border flex-1" />
              <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest whitespace-nowrap">Or continue with</span>
              <div className="h-px bg-nexa-border flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <NexaButton onClick={handleGoogleAuth} variant="secondary" className="h-12 rounded-xl" leftIcon={<IconBrandGoogle className="w-4 h-4" />}>
                Google
              </NexaButton>
              <NexaButton onClick={handleMicrosoftAuth} variant="secondary" className="h-12 rounded-xl">
                Microsoft
              </NexaButton>
            </div>

            <p className="text-center text-sm text-nexa-text-secondary">
              Don't have an account?{" "}
              <Link href="/signup" className="text-nexa-brand font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </NexaCard>
        </motion.div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
