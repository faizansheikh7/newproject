// ChatComponent.js - Real-time Chat with Video Calling
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function ChatComponent({ currentUser, chatPartner }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [inCall, setInCall] = useState(false);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

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
                socket.emit('candidate', { candidate: event.candidate, to: chatPartner.id });
            }
        };

        socket.on('offer', async (offer) => {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { answer, to: chatPartner.id });
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
    }, [chatPartner.id]);

    const sendMessage = () => {
        if (newMessage.trim()) {
            const message = { sender: currentUser.id, text: newMessage };
            socket.emit('message', message);
            setMessages((prev) => [...prev, message]);
            setNewMessage('');
        }
    };

    const startCall = async () => {
        if (peerConnection) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', { offer, to: chatPartner.id });
            setInCall(true);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === currentUser.id ? 'sent' : 'received'}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
            <button onClick={startCall} disabled={inCall}>📹 Start Video Call</button>
            {inCall && (
                <div className="video-call-container">
                    <video ref={localVideo} autoPlay playsInline className="video-feed"></video>
                    <video ref={remoteVideo} autoPlay playsInline className="video-feed"></video>
                </div>
            )}
        </div>
    );
}
