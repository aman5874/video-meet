// app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/app/room/[id]/components/ui/button";
import { Input } from "@/app/room/[id]/components/ui/input";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  // Create a new room with UUID
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    const meetingId = uuidv4();
    router.push(`/room/${meetingId}?host=true&name=${encodeURIComponent(userName)}`);
  };

  // Join an existing room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(userName)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Video Meet
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create a new meeting or join an existing one
        </p>

        {/* Name Input */}
        <div className="mb-6">
          <Input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="flex flex-col space-y-6">
          <Button 
            onClick={handleCreateRoom}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition"
          >
            New Meeting
          </Button>

          <div className="flex items-center justify-between">
            <span className="border-b w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-gray-500 uppercase">or join meeting</span>
            <span className="border-b w-1/5 lg:w-1/4"></span>
          </div>

          <form onSubmit={handleJoinRoom} className="flex flex-col space-y-4">
            <Input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter meeting code"
            />
            <Button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition"
              variant="secondary"
            >
              Join Meeting
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
