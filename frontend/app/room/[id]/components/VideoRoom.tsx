"use client";
// Move all the room logic from page.tsx to this component
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Peer, { MediaConnection } from "peerjs";
import { io, Socket } from "socket.io-client";
import MediaControls from "./MediaControls";
import ChatPanel from "./ChatPanel";
import LocalVideo from "./LocalVideo";
import RemoteVideo from "./RemoteVideo";
import MeetingInfo from './MeetingInfo';
import JoinForm from './JoinForm';
import { FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';

interface Participant {
  userId: string;
  stream: MediaStream;
  userName: string;
}

interface ChatMessage {
  type: 'user' | 'system';
  content: string;
  userName: string;
  timestamp: Date;
}

export default function VideoRoom() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const userName = searchParams.get('name');
  const isHost = searchParams.get('host') === 'true';

  const currentStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, MediaConnection>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Participant[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [notifications, setNotifications] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId || !userName) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
    socketRef.current = socket;

    const myPeer = new Peer();
    const peerConnections = peersRef.current;

    myPeer.on('open', (id) => {
      console.log('My peer ID:', id);
      socket.emit("join-room", roomId, id, userName);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        currentStreamRef.current = stream;

        myPeer.on("call", (call) => {
          console.log("Receiving call from:", call.peer);
          call.answer(stream);
          
          call.on("stream", (userStream: MediaStream) => {
            console.log("Received stream from:", call.peer);
            setRemoteStreams((prev) => {
              if (prev.some((remote) => remote.userId === call.peer)) {
                return prev;
              }
              return [...prev, { 
                userId: call.peer, 
                stream: userStream, 
                userName: 'Remote User'
              }];
            });
          });
        });

        socket.on("user-connected", (userId: string, remoteUserName: string) => {
          console.log("User connected:", userId, remoteUserName);
          if (isHost) {
            setNotifications(prev => [...prev, `${remoteUserName} joined the meeting`]);
          }

          const call = myPeer.call(userId, stream);
          
          call.on("stream", (userStream: MediaStream) => {
            console.log("Received stream from new user:", userId);
            setRemoteStreams((prev) => {
              if (prev.some((remote) => remote.userId === userId)) {
                return prev;
              }
              return [...prev, { 
                userId, 
                stream: userStream, 
                userName: remoteUserName 
              }];
            });
          });

          peerConnections[userId] = call;
        });

        socket.on("user-disconnected", (userId: string, disconnectedUserName: string) => {
          console.log("User disconnected:", userId);
          if (isHost) {
            setNotifications(prev => [...prev, `${disconnectedUserName} left the meeting`]);
          }
          setRemoteStreams((prev) => prev.filter((remote) => remote.userId !== userId));
          if (peerConnections[userId]) {
            peerConnections[userId].close();
            delete peerConnections[userId];
          }
        });

        socket.on("chat-message", (data: {
          type: 'user' | 'system';
          content: string;
          userId: string;
          userName: string;
        }) => {
          setChatMessages((prev) => [...prev, {
            type: data.type,
            content: data.content,
            userName: data.userName,
            timestamp: new Date()
          }]);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert("Failed to access camera and microphone. Please grant permission and try again.");
      });

    return () => {
      socket.disconnect();
      Object.values(peerConnections).forEach((call) => call.close());
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, userName, isHost]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoMuted(!videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (currentStreamRef.current) {
          const videoTrack = currentStreamRef.current.getVideoTracks()[0];
          videoTrack.stop();
        }
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(newStream);
        currentStreamRef.current = newStream;
        setIsScreenSharing(false);
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(screenStream);
        currentStreamRef.current = screenStream;
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim() && roomId && socketRef.current) {
      socketRef.current.emit("chat-message", {
        roomId,
        message: chatInput.trim(),
        userName: userName || 'Anonymous'
      });

      setChatInput("");
    }
  };

  if (!userName) {
    return <JoinForm roomId={roomId} />;
  }

  // Combine local and remote streams for the grid layout
  const combinedStreams = [];
  if (localStream) {
    combinedStreams.push({ userId: "local", stream: localStream, userName: userName || 'You' });
  }
  combinedStreams.push(...remoteStreams);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Video Meet</h1>
            {isHost && <span className="text-xs px-2 py-1 bg-blue-500 rounded-full">Host</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <MeetingInfo roomId={roomId} isHost={isHost} />
            </div>
            <button 
              onClick={() => window.location.href = '/'} 
              className="text-red-500 hover:text-red-400 transition"
            >
              Leave
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Meeting Info */}
      <div className="md:hidden p-4 bg-black/20">
        <MeetingInfo roomId={roomId} isHost={isHost} />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Video Grid */}
          <div className="flex-1">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-4 space-y-2">
                {notifications.map((notification, index) => (
                  <div 
                    key={index} 
                    className="bg-black/40 text-sm text-gray-300 p-2 rounded-lg animate-fade-in"
                  >
                    {notification}
                  </div>
                ))}
              </div>
            )}

            {/* Video Grid */}
            <div className={`grid gap-4 ${
              combinedStreams.length <= 1 ? 'grid-cols-1' :
              combinedStreams.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
              combinedStreams.length <= 4 ? 'grid-cols-2' :
              'grid-cols-2 lg:grid-cols-3'
            }`}>
              {combinedStreams.map((participant) => (
                <div 
                  key={participant.userId} 
                  className={`relative aspect-video rounded-xl overflow-hidden bg-black/50 ${
                    combinedStreams.length === 1 ? 'max-w-3xl mx-auto' : ''
                  }`}
                >
                  {participant.userId === "local" ? (
                    <>
                      <LocalVideo stream={participant.stream} />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <span className="bg-black/60 px-2 py-1 rounded-lg text-sm">
                          {participant.userName} (You)
                        </span>
                        <div className="flex gap-2">
                          {isAudioMuted && (
                            <span className="bg-red-500/80 p-1 rounded-lg">
                              <FaMicrophoneSlash size={14} />
                            </span>
                          )}
                          {isVideoMuted && (
                            <span className="bg-red-500/80 p-1 rounded-lg">
                              <FaVideoSlash size={14} />
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <RemoteVideo 
                      stream={participant.stream} 
                      userName={participant.userName} 
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-white/10 p-4 lg:relative lg:bg-transparent lg:border-0 lg:backdrop-blur-none">
              <div className="max-w-7xl mx-auto">
                <MediaControls
                  isAudioMuted={isAudioMuted}
                  isVideoMuted={isVideoMuted}
                  isScreenSharing={isScreenSharing}
                  toggleAudio={toggleAudio}
                  toggleVideo={toggleVideo}
                  toggleScreenShare={toggleScreenShare}
                />
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:w-80 xl:w-96 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
            <ChatPanel
              messages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              sendChatMessage={sendChatMessage}
              userName={userName || 'Anonymous'}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 