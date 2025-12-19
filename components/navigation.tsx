"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, User, Home, Swords, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { player,isAuthenticated, logout, isLoading } = useAuth()

  const links = [
    { href: "/", label: "Home", icon: Home },
   // { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
   // { href: "/profile", label: "Profile", icon: User },
  ]

  // Don't show navigation during active game or auth pages
  if (pathname === "/game" || pathname === "/login" || pathname === "/register") {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Swords className="w-6 h-6 text-orange-500 "/>
            <span className="font-bebas text-2xl tracking-wider text-foreground">
              TEST <span className="text-orange-500">ROYALE</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, <span className="text-foreground font-medium">{player?.name}</span>
                  </span>
                  <Button
  variant="outline"
  size="sm"
  onClick={handleLogout}
 className="flex items-center gap-2 border-muted-foreground text-muted-foreground 
             hover:bg-orange-600 hover:text-white hover:border-orange-600
             active:bg-orange-700 active:border-orange-700
             transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
>
  <LogOut className="w-4 h-4" />
  Logout
</Button>
                </div>
              ) : (
               <div className="flex items-center gap-2">

<Button asChild variant="outline" size="sm" 
  className="flex items-center gap-2 border-muted-foreground text-muted-foreground 
             hover:bg-orange-600 hover:text-white hover:border-orange-600
             active:bg-orange-700 active:border-orange-700
             transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
>
  <Link href="/login" className="flex items-center gap-2">
    <LogIn className="w-4 h-4" />
    Login
  </Link>
</Button>
  <Button asChild size="sm" 
    className="flex items-center gap-2 bg-gradient-to-r
                   from-orange-600 to-orange-500 hover:from-orange-500
                   hover:to-orange-400 text-white font-bebas shadow-lg shadow-orange-500/20 
                   hover:shadow-orange-400/30 transition-all duration-300 transform hover:scale-[1.02] 
                   active:scale-[0.98]"
  >
    <Link href="/register" className="flex items-center gap-2">
      Register
    </Link>
  </Button>
</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
