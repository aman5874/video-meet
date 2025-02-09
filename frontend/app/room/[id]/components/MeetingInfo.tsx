"use client";
import { useState, useEffect } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

interface MeetingInfoProps {
  roomId: string;
  isHost: boolean;
}

export default function MeetingInfo({ roomId, isHost }: MeetingInfoProps) {
  const [copied, setCopied] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMeetingLink(`${window.location.origin}/room/${roomId}`);
    }
  }, [roomId]);

  const copyToClipboard = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!meetingLink) return null; // Don't render until we have the link

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h2 className="text-lg font-semibold mb-2">Meeting Info</h2>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={meetingLink}
          readOnly
          className="flex-1 bg-gray-700 p-2 rounded text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition"
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? <FaCheck /> : <FaCopy />}
        </button>
      </div>
      {isHost && (
        <p className="text-sm text-gray-400 mt-2">
          Share this link with others to invite them to the meeting
        </p>
      )}
    </div>
  );
} 