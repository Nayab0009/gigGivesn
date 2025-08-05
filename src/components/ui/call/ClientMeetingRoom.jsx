"use client";

import { useState, useRef, memo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/call/button";
import { Input } from "@/components/ui/call/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle } from "@/components/ui/call/alert";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import VideoCallScreen from "@/components/ui/call/CallingUi";

const backendDomain = "https://geekjives-26190134d520.herokuapp.com/signaling";

const peerConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function IndividualMeetingRoom() {
  const searchParams = useSearchParams();
  const [stream, setStream] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomID, setRoomID] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [loadingForJoiningCall, setLoadingForJoiningCall] = useState(false);
  const [participants, setParticipants] = useState([]);

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const pendingIceCandidates = useRef({});
  // --- NEW: Ref to track negotiation state for each peer ---
  const isNegotiating = useRef({});

  // Get roomID from URL and restore user name from localStorage
  useEffect(() => {
    const room = searchParams.get("roomId");
    if (room) setRoomID(room);

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserName(JSON.parse(storedUser)?.name || "");
      } catch (e) { console.error(e); }
    }
  }, [searchParams]);

  // Effect 1: Handles the socket connection lifecycle
  useEffect(() => {
    if (!roomID) return;
    const socket = io(backendDomain, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => console.log("Socket connected:", socket.id));
    socket.on('disconnect', () => console.log("Socket disconnected."));
    return () => socket.disconnect();
  }, [roomID]);

  // --- This is now a standalone, memoized function ---
  const createPeerConnection = useCallback((remoteUserName) => {
    if (peerConnectionsRef.current[remoteUserName]) {
      return peerConnectionsRef.current[remoteUserName];
    }
    const pc = new RTCPeerConnection(peerConfiguration);

    if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }
    
    pc.ontrack = (event) => {
      setParticipants((prev) => {
        if (prev.find((p) => p.name === remoteUserName)) {
          return prev.map((p) => p.name === remoteUserName ? { ...p, stream: event.streams[0] } : p);
        }
        return [...prev, { name: remoteUserName, stream: event.streams[0], micOn: true, videoOn: true }];
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("sendIceCandidate", { roomID, senderName: userName, targetName: remoteUserName, candidate: event.candidate });
      }
    };
    peerConnectionsRef.current[remoteUserName] = pc;
    return pc;
  }, [stream, roomID, userName]);

  // Effect 2: Manages all socket event listeners
  useEffect(() => {
    if (!socketRef.current || !userName || !stream) return;

    const socket = socketRef.current;

    const processPendingCandidates = async (senderName) => {
        const pc = peerConnectionsRef.current[senderName];
        const candidates = pendingIceCandidates.current[senderName];
        if (pc?.remoteDescription && candidates?.length) {
            for (const candidate of candidates) {
                try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
                catch (err) { console.error(err); }
            }
            pendingIceCandidates.current[senderName] = [];
        }
    };

    const handleReceiveOffer = async ({ offer, senderName }) => {
        const pc = createPeerConnection(senderName);
        
        // Handle race condition where an offer is received while already handling one.
        if (pc.signalingState !== 'stable') {
            console.log("Ignoring offer, not in stable state.");
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processPendingCandidates(senderName);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("sendAnswer", { roomID, senderName: userName, receiverName: senderName, answer });
    };

    const handleReceiveAnswer = async ({ answer, senderName }) => {
        const pc = peerConnectionsRef.current[senderName];
        if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await processPendingCandidates(senderName);
            // Negotiation is complete, reset the flag
            isNegotiating.current[senderName] = false;
        }
    };

    const handleReceiveIceCandidate = async ({ candidate, senderName }) => {
        const pc = peerConnectionsRef.current[senderName];
        if (pc?.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            if (!pendingIceCandidates.current[senderName]) pendingIceCandidates.current[senderName] = [];
            pendingIceCandidates.current[senderName].push(candidate);
        }
    };

    const handleUserDisconnected = ({ name }) => {
        peerConnectionsRef.current[name]?.close();
        delete peerConnectionsRef.current[name];
        delete isNegotiating.current[name];
        setParticipants((prev) => prev.filter((p) => p.name !== name));
    };

    socket.on("receiveOffer", handleReceiveOffer);
    socket.on("receiveAnswer", handleReceiveAnswer);
    socket.on("receiveIceCandidate", handleReceiveIceCandidate);
    socket.on("userDisconnected", handleUserDisconnected);

    return () => {
      socket.off("receiveOffer", handleReceiveOffer);
      socket.off("receiveAnswer", handleReceiveAnswer);
      socket.off("receiveIceCandidate", handleReceiveIceCandidate);
      socket.off("userDisconnected", handleUserDisconnected);
    };
  }, [userName, stream, roomID, createPeerConnection]);

  const createAndSendOffer = useCallback(async (targetName) => {
    // --- FIX: Check the negotiation flag before proceeding ---
    if (isNegotiating.current[targetName]) {
      console.log(`Already negotiating with ${targetName}, skipping new offer.`);
      return;
    }
    // --- FIX: Set the negotiation flag ---
    isNegotiating.current[targetName] = true;

    try {
      const pc = createPeerConnection(targetName);
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
  
      socketRef.current.emit("sendOffer", { roomID, senderName: userName, targetName, offer });
    } catch (e) {
      console.error(`Error creating offer for ${targetName}:`, e);
      // Reset flag on error
      isNegotiating.current[targetName] = false;
    }
  }, [roomID, userName, createPeerConnection]);

  const requestMediaPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;
      setPermissionDenied(false);
    } catch (error) {
      setPermissionDenied(true);
    }
  };

  const handleJoin = () => {
    if (!userName.trim()) return toast({ title: "Please enter your name." });
    if (!stream) return toast({ title: "Please grant camera and mic access." });
    
    setLoadingForJoiningCall(true);
    const payload = { roomID, name: userName.trim() };
    
    socketRef.current.emit("joinRoom", payload, (ack) => {
      setLoadingForJoiningCall(false);
      if (ack.sameName) {
        return toast({ title: `Name '${ack.existingName}' is already taken.`, variant: "destructive" });
      }

      setParticipants([{ name: userName.trim(), stream: stream, micOn: true, videoOn: true }]);
      setIsInCall(true);

      if (ack.existingUsers?.length > 0) {
        ack.existingUsers.forEach((name) => createAndSendOffer(name));
      }
    });
  };

  return (
    // ... JSX is unchanged ...
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      {isInCall ? (
        <VideoCallScreen
          localStream={stream}
          participants={participants}
          setParticipants={setParticipants}
          localUserName={userName.trim()}
          socket={socketRef.current}
          roomID={roomID}
        />
      ) : (
        <div className="container mx-auto px-4 lg:px-20 py-8">
          <div className={`grid ${stream ? "lg:grid-cols-2" : "grid-cols-1"} gap-8`}>
            <div className="border border-gray-600 p-6 rounded-lg flex flex-col items-center justify-center min-h-[350px]">
              {!stream && !permissionDenied && (
                <div className="text-center">
                  <h2 className="text-xl mb-4">Ready to join?</h2>
                  <p className="text-sm text-gray-500 mb-6">Grant camera and mic access to continue.</p>
                  <Button onClick={requestMediaPermissions} className="rounded-full px-7">Grant Access</Button>
                </div>
              )}
              {permissionDenied && <PermissionDenied />}
              <video ref={localVideoRef} autoPlay playsInline muted className={`rounded-lg w-full h-full object-cover ${stream ? 'block' : 'hidden'}`} />
            </div>
            {stream && (
              <div className="self-center p-6 rounded-lg flex flex-col space-y-6">
                <h2 className="text-3xl font-semibold text-center">You're all set</h2>
                <Input
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="!border-gray-700 bg-gray-900 text-white border"
                />
                <Button disabled={loadingForJoiningCall || !socketRef.current?.connected} onClick={handleJoin} className="rounded-full py-3 text-lg">
                  {loadingForJoiningCall ? <Loader2 className="animate-spin w-5 h-5" /> : "Join Call"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const PermissionDenied = memo(() => (
  // ... JSX is unchanged ...
  <div className="max-w-md mx-auto p-4 space-y-4 bg-gray-950 rounded-xl">
    <Alert variant="destructive" className="border-red-900/50 bg-red-950/50 border-2">
      <div className="flex text-white items-center gap-4 justify-center">
        <Camera className="h-5 w-5" />
        <AlertTitle className="text-lg !mb-0 font-semibold">Permission Required</AlertTitle>
      </div>
    </Alert>
    <div className="p-2">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Please enable camera and microphone access in your browser settings to continue.</h3>
      <Button onClick={() => window.location.reload()} className="mt-4 w-full rounded-full">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh and Try Again
      </Button>
    </div>
  </div>
));
PermissionDenied.displayName = "PermissionDenied";