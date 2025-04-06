import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5173');

export default function ChatWithVideo({ userId, peerId }) {
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [inCall, setInCall] = useState(false);

    useEffect(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        setPeerConnection(pc);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideo.current.srcObject = stream;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            });

        pc.ontrack = (event) => {
            remoteVideo.current.srcObject = event.streams[0];
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', { candidate: event.candidate, to: peerId });
            }
        };

        socket.on('offer', async (offer) => {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { answer, to: peerId });
            setInCall(true);
        });

        socket.on('answer', async (answer) => {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('candidate', async (candidate) => {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            pc.close();
        };
    }, [peerId]);

    const startCall = async () => {
        if (peerConnection) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer, to: peerId });
            setInCall(true);
        }
    };

    return (
        <div>
            <div>
                <button onClick={startCall} disabled={inCall} className="video-call-button">
                    📹 Start Video Call
                </button>
            </div>
            {inCall && (
                <div className="video-call-container">
                    <video ref={localVideo} autoPlay playsInline className="video-feed"></video>
                    <video ref={remoteVideo} autoPlay playsInline className="video-feed"></video>
                </div>
            )}
        </div>
    );
}