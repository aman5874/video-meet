"use client";
import { useEffect, useRef } from "react";

interface LocalVideoProps {
  stream: MediaStream | null;
}

export default function LocalVideo({ stream }: LocalVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      className="w-full max-w-lg border-4 border-blue-500 rounded-lg mb-4"
    />
  );
}
