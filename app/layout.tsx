"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/lib/auth-context";
import BackgroundEffects from "@/components/background-effects";
import GlobalClickSound from "./GlobalClickSound";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

const hideNavPages = ["register", "login", "room", "game"];

const hideNav = hideNavPages.some(p => pathname.split("/").includes(p));


  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {!hideNav && <Navigation />}
          <BackgroundEffects />
           <GlobalClickSound />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
