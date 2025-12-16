"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
    await login(formData);
    
    const success = new Audio("/game_success_loading.mp3");
    success.play();

    // Redirect after sound starts
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
     {/* Main Content */}
      <div className="w-full max-w-md space-y-8">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <Swords className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 w-10 h-10 bg-orange-400/10 rounded-full blur-lg group-hover:bg-orange-500/20 transition-all duration-300" />
              </div>
              <span className="font-bebas text-4xl tracking-wider">
                <span className="text-white">TEST</span>{" "}
                <span className="text-orange-500">ROYALE</span>
              </span>
            </Link>
            
            <div className="space-y-2">
              <h1 className="font-bebas text-5xl tracking-wider text-foreground drop-shadow-[0_0_20px_rgba(255,165,0,0.6)]">
                LOGIN 
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
                <p className="text-foreground text-lg font-medium">
                  Enter the arena, warrior
                </p>
                <Target className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card className="relative bg-slate-900/95 backdrop-blur-md border border-orange-500/30 p-8 shadow-xl">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
               <Alert style={{ 
    backgroundColor: 'var(--error-bg)',
    borderColor: 'var(--error)',
    color: 'white'
  }}>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-xs font-bold text-foreground uppercase tracking-wider">
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
                    className="bg-input/50 text-foreground placeholder-muted-foreground 
                    focus:ring-1 transition-all duration-200 pr-12"
                      style={{
                      borderColor: 'var(--border)',
                      ['--tw-ring-color' as any]: 'var(--ring)',
                    }}               />
                  <div className="absolute inset-0 border-2 group-focus-within:border rounded-md transition-all duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                 <Label htmlFor="password" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative ">
                  <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-input/50 text-foreground placeholder-muted-foreground 
                    focus:ring-1 transition-all duration-200 pr-12"
                      style={{
                      borderColor: 'var(--border)',
                      ['--tw-ring-color' as any]: 'var(--ring)',
                    }}               />
                  <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground
                    hover:text-accent transition-colors duration-200"
                  >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  </button>
                  <div className="absolute inset-0 border-2 border-orange-400/0 group-focus-within:border-orange-400/50 rounded-md transition-all duration-300 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-foreground font-bebas text-2xl tracking-wider py-6 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? "CREATING WARRIOR..." : "JOIN THE BATTLE"}
              </Button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <p className="text-orange/80 text-sm">
                New to the battle?{" "}
                <Link
  href="/register"
  className="text-primary hover:text-accent font-semibold transition-colors duration-200"
                >
  Join the fight
</Link>

              </p>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}