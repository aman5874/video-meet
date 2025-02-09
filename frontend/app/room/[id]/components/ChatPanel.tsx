"use client";
import { useEffect, useRef } from 'react';
import { FaComments, FaPaperPlane } from "react-icons/fa";
import { Button } from "@/app/room/[id]/components/ui/button";
import { Textarea } from "@/app/room/[id]/components/ui/textarea";
import { Separator } from "@/app/room/[id]/components/ui/separator";
import { Avatar, AvatarFallback } from "@/app/room/[id]/components/ui/avatar";

interface ChatMessage {
  type: 'user' | 'system';
  content: string;
  userName: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  sendChatMessage: () => void;
  userName: string;
}

export default function ChatPanel({
  messages,
  chatInput,
  setChatInput,
  sendChatMessage,
  userName
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <FaComments className="text-muted-foreground" size={20} />
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>
      
      <Separator className="mb-4" />
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === 'system' 
                ? 'justify-center' 
                : msg.userName === userName
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {msg.type === 'system' ? (
              <div className="bg-muted px-3 py-1.5 rounded-full text-xs text-muted-foreground">
                {msg.content}
              </div>
            ) : (
              <div className={`flex gap-2 max-w-[80%] ${
                msg.userName === userName ? 'flex-row-reverse' : ''
              }`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {msg.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className={`rounded-2xl px-4 py-2 ${
                    msg.userName === userName
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {msg.userName === userName ? 'You' : msg.userName}
                    </div>
                    <div className="break-words">
                      {msg.content}
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 px-2">
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className="flex gap-2">
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[2.5rem] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={sendChatMessage}
            disabled={!chatInput.trim()}
            size="icon"
            className="shrink-0"
          >
            <FaPaperPlane size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
