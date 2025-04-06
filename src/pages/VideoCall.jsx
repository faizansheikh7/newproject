import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Corrected signaling server port

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    socket.on("offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer);
      setIsCallActive(true);
    });

    socket.on("answer", async (answer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("candidate", async (candidate) => {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    setPeerConnection(pc);
  }, []);

  const startCall = async () => {
    if (peerConnection) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
      setIsCallActive(true);
    }
  };

  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setIsCallActive(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Video Call</h2>
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay playsInline className="w-64 h-48 bg-gray-300" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 bg-gray-300" />
      </div>
      {!isCallActive ? (
        <button onClick={startCall} className="bg-blue-500 text-white px-4 py-2 rounded">
          Start Call
        </button>
      ) : (
        <button onClick={endCall} className="bg-red-500 text-white px-4 py-2 rounded">
          End Call
        </button>
      )}
    </div>
  );
};

export default VideoCall;