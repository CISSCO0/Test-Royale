"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Swords, Eye, EyeOff, Zap, Target } from "lucide-react";
import { useAuth } from "@/lib/auth-context";



export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);


   // Generate floating particles for background animation
useEffect(() => {
  const generateParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 5, // slow: 8–13s
    }));
    setParticles(newParticles);
  };
  generateParticles();
}, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(formData);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />
      </div>

{particles.map((particle) => (
  <div
    key={particle.id}
    className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
    style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite, glow 2s ease-in-out infinite`,
      transformOrigin: `${50 + Math.random() * 50}% ${50 + Math.random() * 50}%`,
      boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)',
    }}
  />
))}


      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <Swords className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-10 h-10 bg-cyan-400/10 rounded-full blur-lg group-hover:bg-cyan-400/20 transition-all duration-300" />
              </div>
              <span className="font-bebas text-4xl tracking-wider">
                <span className="text-white">TEST</span>{" "}
                <span className="text-cyan-400">ROYALE</span>
              </span>
            </Link>
            
            <div className="space-y-2">
              <h1 className="font-bebas text-5xl tracking-wider text-foreground drop-shadow-[0_0_20px_rgba(255,165,0,0.6)]">
                LOGIN
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400text-cyan-400animate-pulse" />
                <p className="text-cyan-400 text-lg font-medium">
                  Enter the arena, warrior
                </p>
                <Target className="w-4 h-4 text-cyan-400text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card className="relative bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 p-8 shadow-xl">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <Alert variant="destructive" className="bg-red-900/80 border-red-500/50 text-red-200">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-slate-950/50 border border-cyan-500/30 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-200"
                  />
                  <div className="absolute inset-0 border-2 group-focus-within:border rounded-md transition-all duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative group">
                  <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-slate-950/50 border border-cyan-500/30 text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-200 pr-12"
                  />
                  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                  >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  </button>
                  <div className="absolute inset-0 border-2 border-cyan-400/0 group-focus-within:border-cyan-400/50 rounded-md transition-all duration-300 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bebas text-2xl tracking-wider py-6 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "CREATING WARRIOR..." : "JOIN THE BATTLE"}
              </Button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <p className="text-cyan/80 text-sm">
                New to the battle?{" "}
                <Link
  href="/register"
  className="text-white hover:text-cyan-400 font-bold underline decoration-transparent hover:decoration-cyan-400 transition-all duration-300"
>
  Join the fight
</Link>

              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}