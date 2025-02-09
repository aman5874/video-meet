"use client";
import { useEffect, useRef } from "react";

interface RemoteVideoProps {
  stream: MediaStream;
  userName: string;
}

export default function RemoteVideo({ stream, userName }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        className="w-full h-full object-cover rounded-lg"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
        {userName}
      </div>
    </div>
  );
}
