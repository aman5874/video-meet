"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/app/room/[id]/components/ui/button";
import { Input } from "@/app/room/[id]/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/room/[id]/components/ui/card";

interface JoinFormProps {
  roomId: string;
}

export default function JoinForm({ roomId }: JoinFormProps) {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Join Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Enter your name
              </label>
              <Input
                id="name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Join Meeting
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 