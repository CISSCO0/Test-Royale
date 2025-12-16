"use client";

import { useEffect } from "react";

export default function GlobalClickSound() {
  useEffect(() => {
    const sound = new Audio("/zapsplat.mp3");

    const play = () => {
      sound.currentTime = 0;
      sound.play();
    };

    document.addEventListener("click", play);

    return () => document.removeEventListener("click", play);
  }, []);

  return null;
}
