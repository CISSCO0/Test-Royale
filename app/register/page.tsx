"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Swords, Eye, EyeOff, CheckCircle, Zap, Target, Shield, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";


export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-background">
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


        {/* Success Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="relative bg-card/95 backdrop-blur-md border-primary/30 p-12 max-w-md w-full shadow-xl">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 text-center space-y-6">
              <div className="relative inline-block">
                <CheckCircle className="w-20 h-20 text-primary mx-auto" />
                <div className="absolute inset-0 w-20 h-20 bg-primary/10 rounded-full blur-xl mx-auto animate-pulse" />
              </div>

              <h2 className="font-bebas text-5xl tracking-wider text-foreground">
                WELCOME TO THE ARENA!
              </h2>

              <div className="flex items-center justify-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <p className="text-foreground/90 text-lg font-medium">
                  Your warrior profile has been created
                </p>
                <Shield className="w-5 h-5 text-primary" />
              </div>

              <p className="text-muted-foreground">
                Preparing your battle station...
              </p>

              <div className="flex items-center justify-center gap-3 pt-4">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-primary font-bold tracking-wider">
                  INITIALIZING...
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
  <div >
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <Swords className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div 
                  className="absolute inset-0 w-10 h-10 rounded-full blur-lg group-hover:opacity-30 transition-all duration-300"
                  style={{ backgroundColor: 'var(--glow-orange)' }}
                />
              </div>
              <span className="font-bebas text-4xl tracking-wider">
                <span className="text-foreground">TEST</span>{" "}
                <span className="text-primary">ROYALE</span>
              </span>
            </Link>

            <div className="space-y-3">
              <h1 className="font-bebas text-6xl tracking-wider text-foreground">REGISTER</h1>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-foreground/80 text-base">Create your warrior profile</p>
                <Crown className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          <Card className="relative bg-card/95 backdrop-blur-md border p-8 shadow-2xl"
            style={{ borderColor: 'var(--border)' }}>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <Alert variant="destructive" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error)' }}>
                  <AlertDescription className="text-destructive-foreground">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold text-primary uppercase tracking-wider">
                  Warrior Name
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose your warrior name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-input/50 text-foreground placeholder-muted-foreground 
                  focus:ring-1 transition-all duration-200"
              style={{
  borderColor: 'var(--border)',
  ['--tw-ring-color' as any]: 'var(--ring)',
}}

                />
              </div>

              {/* Email Input - similar styling */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-primary uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-input/50 text-foreground placeholder-muted-foreground 
                  focus:ring-1 transition-all duration-200"
                  style={{
  borderColor: 'var(--border)',
  ['--tw-ring-color' as any]: 'var(--ring)',
}}

                />
              </div>

              {/* Password fields with similar styling... */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-primary uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-input/50 text-foreground placeholder-muted-foreground 
                    focus:ring-1 transition-all duration-200 pr-12"
                   style={{
  borderColor: 'var(--border)',
  ['--tw-ring-color' as any]: 'var(--ring)',
}}

                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-accent transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword" 
                  className="text-xs font-bold text-primary uppercase tracking-wider"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-input/50 text-foreground 
                    placeholder-muted-foreground focus:border-primary focus:ring-2 
                    focus:ring-primary/50 transition-all duration-300 pr-12"
                   style={{
  borderColor: 'var(--border)',
  ['--tw-ring-color' as any]: 'var(--ring)',
}}

                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary 
                    hover:text-accent transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-bebas text-2xl tracking-wider py-6 
                shadow-lg transition-all duration-300 transform 
                hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'linear-gradient(to right, var(--primary), var(--accent))',
                  color: 'var(--primary-foreground)',
                  // @ts-ignore
                  '--tw-shadow-color': 'var(--glow-orange)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ 
                        borderColor: 'var(--primary-foreground)',
                        borderTopColor: 'transparent'
                      }} 
                    />
                    CREATING WARRIOR...
                  </div>
                ) : (
                  "JOIN THE BATTLE"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center relative z-10">
              <p className="text-muted-foreground text-sm">
                Already a warrior?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-accent font-semibold transition-colors duration-200"
                >
                  Enter the arena
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}