import React, { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/call/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react";
import UniversalTooltip from "./TooltipUniversal";

const VideoCallScreen = memo(
  ({ localStream, participants, setParticipants, localUserName, socket, roomID }) => {
    const videoRefs = useRef({});

    // Effect to attach streams to video elements
    useEffect(() => {
      participants.forEach((participant) => {
        const videoElement = videoRefs.current[participant.name];
        if (videoElement && participant.stream) {
          if (videoElement.srcObject !== participant.stream) {
            videoElement.srcObject = participant.stream;
          }
        }
      });
    }, [participants]);

    // This component uses the `enabled` property of the local stream directly
    const [isVideoEnabled, setIsVideoEnabled] = useState(() => localStream?.getVideoTracks()[0]?.enabled ?? true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(() => localStream?.getAudioTracks()[0]?.enabled ?? true);

    // Effect to handle incoming media state changes from other users
    useEffect(() => {
      const handleMediaStateChanged = ({ userName, enabled, mediaType }) => {
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.name === userName) {
              return { ...p, [mediaType === "video" ? "videoOn" : "micOn"]: enabled };
            }
            return p;
          })
        );
      };

      socket?.on("mediaStateChanged", handleMediaStateChanged);

      return () => {
        socket?.off("mediaStateChanged", handleMediaStateChanged);
      };
    }, [socket, setParticipants]);

    const toggleMedia = (mediaType) => {
      if (!localStream) return;

      const track = mediaType === "video" 
        ? localStream.getVideoTracks()[0] 
        : localStream.getAudioTracks()[0];

      if (track) {
        track.enabled = !track.enabled;
        const isEnabled = track.enabled;

        if (mediaType === "video") setIsVideoEnabled(isEnabled);
        else setIsAudioEnabled(isEnabled);

        // Update local participant state
        setParticipants((prev) =>
          prev.map((p) => (p.name === localUserName ? { ...p, [mediaType === "video" ? "videoOn" : "micOn"]: isEnabled } : p))
        );

        // Notify other users
        socket?.emit("mediaStateChange", {
          roomID,
          userName: localUserName,
          enabled: isEnabled,
          mediaType,
        });
      }
    };

    const handleLeaveCall = () => {
      socket?.disconnect();
      // Redirect to home or a "call ended" page
      window.location.href = "/";
    };

    // Calculate grid layout based on number of participants
    const gridLayout = (count) => {
        if (count <= 2) return "lg:grid-cols-2";
        if (count <= 4) return "lg:grid-cols-2";
        if (count <= 6) return "lg:grid-cols-3";
        return "lg:grid-cols-4";
    };

    return (
      <div className="flex h-screen w-full flex-col bg-gray-950 text-gray-100">
        <main className="flex-1 relative p-4">
          <div className={`grid grid-cols-1 ${gridLayout(participants.length)} gap-4 h-full`}>
            {participants.map((participant) => (
              <div key={participant.name} className="relative rounded-lg bg-gray-900 overflow-hidden flex items-center justify-center">
                <video
                  ref={(el) => { if (el) videoRefs.current[participant.name] = el; }}
                  autoPlay
                  playsInline
                  muted={participant.name === localUserName}
                  className={`w-full h-full object-cover ${participant.videoOn ? "" : "hidden"}`}
                />
                {!participant.videoOn && <Users className="h-16 w-16 text-gray-400" />}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-3 py-1 rounded-md text-sm">
                  {participant.name} {participant.name === localUserName && "(You)"}
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 p-1.5 rounded-full">
                    {participant.micOn ? <Mic className="h-4 w-4"/> : <MicOff className="h-4 w-4 text-red-500"/> }
                </div>
              </div>
            ))}
          </div>
        </main>
        {/* Call Controls */}
        <footer className="p-4 flex justify-center items-center gap-4 bg-gray-950 border-t border-gray-800">
           <div className="p-6 flex justify-center gap-9 bg-gray-950 border-t-gray-700 border-t-[1px]">
            <UniversalTooltip
              trigger={
                
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleLeaveCall}
                  asChild={true}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  <span className="p-2">
                    <PhoneOff className="h-6 w-6" />
                  </span>
                </Button>
              }
              content={"Leave call"}
            />

            <div
              className="flex justify-center items-center border border-gray-600 p-2 rounded-md"
              onClick={() => toggleMedia("video")}
            >
              <UniversalTooltip
                trigger={!isVideoEnabled ? <VideoOff className="h-6 w-5" /> : <Video className="h-5 w-6" />}
                content={`Turn video ${!isVideoEnabled ? "on" : "off"}`}
              />
            </div>
            <div
              className="flex justify-center items-center border border-gray-600 p-2 rounded-md"
              onClick={() => toggleMedia("audio")}
            >
              <UniversalTooltip
                trigger={!isAudioEnabled ? <MicOff className="h-6 w-6" /> : <Mic className="h-5 w-6" />}
                content={`Turn Audio ${!isAudioEnabled ? "on" : "off"}`}
              />
            </div>
          </div>
        </footer>
      </div>
    );
  }
);
VideoCallScreen.displayName = "VideoCallScreen";

export default VideoCallScreen;