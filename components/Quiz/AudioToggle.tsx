"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AudioToggle() {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgAudio = new Audio("/audio/soft-melody.mp3"); // Place your audio file in public/audio/
    bgAudio.loop = true;
    setAudio(bgAudio);
  }, []);

  const toggleAudio = () => {
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <Button onClick={toggleAudio} className="mt-4">
      {playing ? "Pause Music" : "Play Music"}
    </Button>
  );
}
