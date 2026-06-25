"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User,
  ArrowRight, 
  ChevronLeft,
  Chrome,
  ShieldCheck
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/signup", { name, email, password, role: "CLIENT" });
      login(data.token, data.user);
      router.push("/client/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen flex flex-col">
      <NexaNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-nexa-brand/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-nexa-accent/5 blur-[120px] rounded-full" />
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
              <h1 className="text-3xl font-extrabold text-display mb-2 leading-none">Create Account</h1>
              <p className="text-nexa-text-secondary text-sm">Join Nexa to discover and book local services.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}
              <NexaInput
                label="Full Name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                disabled={loading}
              />

              <NexaInput
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={loading}
              />
              
              <NexaInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                disabled={loading}
              />

              <div className="flex items-start gap-3 p-4 rounded-xl bg-nexa-bg-base/50 border border-nexa-border">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-nexa-text-secondary leading-relaxed">
                  By signing up, you agree to our <span className="text-nexa-brand font-bold">Terms of Service</span> and <span className="text-nexa-brand font-bold">Privacy Policy</span>.
                </p>
              </div>

              <NexaButton 
                size="lg" 
                type="submit"
                isLoading={loading}
                className="w-full h-14 rounded-2xl shadow-xl shadow-nexa-brand/20 font-extrabold text-lg" 
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </NexaButton>
            </form>

            <div className="mt-10 mb-8 flex items-center gap-4">
              <div className="h-px bg-nexa-border flex-1" />
              <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest whitespace-nowrap">Or sign up with</span>
              <div className="h-px bg-nexa-border flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <NexaButton onClick={handleGoogleAuth} variant="secondary" className="h-12 rounded-xl" leftIcon={<Chrome className="w-4 h-4" />}>
                Google
              </NexaButton>
              <NexaButton onClick={handleMicrosoftAuth} variant="secondary" className="h-12 rounded-xl">
                Microsoft
              </NexaButton>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-nexa-text-secondary">
                Already have an account?{" "}
                <Link href="/login" className="text-nexa-brand font-bold hover:underline">
                  Sign In
                </Link>
              </p>
              
              <div className="pt-6 border-t border-nexa-border">
                <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-wider mb-2">Are you a business owner?</p>
                <Link href="/join" className="text-xs font-extrabold text-nexa-brand uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
                  List your business instead →
                </Link>
              </div>
            </div>
          </NexaCard>
        </motion.div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
