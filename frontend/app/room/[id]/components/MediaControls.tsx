"use client";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaPhoneSlash
} from "react-icons/fa";
import { Button } from "@/app/room/[id]/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/room/[id]/components/ui/tooltip";

interface MediaControlsProps {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
}

export default function MediaControls({
  isAudioMuted,
  isVideoMuted,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
}: MediaControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleAudio}
            variant={isAudioMuted ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full w-12 h-12"
          >
            {isAudioMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleVideo}
            variant={isVideoMuted ? "destructive" : "secondary"}
            size="icon"
            className="rounded-full w-12 h-12"
          >
            {isVideoMuted ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isVideoMuted ? "Turn Video On" : "Turn Video Off"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            className="rounded-full w-12 h-12"
          >
            <FaDesktop size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => window.location.href = '/'}
            variant="destructive"
            size="icon"
            className="rounded-full w-12 h-12"
          >
            <FaPhoneSlash size={20} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Leave Meeting
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
