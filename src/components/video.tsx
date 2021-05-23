import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient, { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import Peer from 'peerjs';
const ENDPOINT = "http://localhost:3001";

interface PeerProfile {
    username: string
}

interface PeerProfiles {
    [peerId: string]: PeerProfile
}

const VideoPage: React.FC = (props) => {
    const [socket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(socketIOClient(ENDPOINT));
    const [roomId] = useState<string>(useParams<{ roomId: string }>().roomId);
    const [message, setMessage] = useState<string>('');
    const [peer] = useState(new Peer());
    const [peerProfiles] = useState<PeerProfiles>({});

    const appendMessage = (message: string) => {    //, style = undefined
        // check out useRef
        // Parameters: message: String, style: String
        const messageBoard: HTMLDivElement | null = document.querySelector('#message-board');
        const msg = document.createElement('p');
        msg.textContent = message;
        if (messageBoard !== null) {
            messageBoard.append(msg);
            messageBoard.scrollTop = messageBoard.scrollHeight; // auto scroll
        }
    }

    const onMessageChange = (e: React.FormEvent<HTMLInputElement>) => {
        setMessage(e.currentTarget.value);
    }

    const onMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message !== '') {
            appendMessage(message);
            if (socket !== null) {
                socket.emit('send-message', message);
            }
        }
        setMessage('');
    }

    useEffect(() => {
        peer.on('open', () => {
            console.log(peer.id);
        });
        peerProfiles['dummy'] = {username: 'dummy-username'};
        if (socket !== null) {
            socket.emit('join-room', roomId, peer.id);
            socket.on('user-connected', (username) => {
                appendMessage(`Socket.io: ${username} joined room ${roomId}`);
                console.log('oink', peer.id);
                console.log('oink', username);
                peerProfiles[peer.id] = {   // fixme
                    username: username
                };
                console.log(peerProfiles);
            });

            socket.on('broadcast-message', (username, message) => {
                const msg = `${username} (Original): ${message}`;
                appendMessage(msg);
            })

            socket.on('user-disconnected', (username) => {
                appendMessage(`Socket.io: ${username} left.`);
            })
        }

        navigator.mediaDevices.getUserMedia({
            video: { width: 50, height: 50 },
            audio: true
        })
            .then((stream: MediaStream) => {
                const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
                if (myVideo) {
                    myVideo.srcObject = stream;
                    myVideo.muted = true;
                }
                peer.on('call', (mediaConnection) => {
                    return;
                })
            })
            .catch((error) => {
                console.log('getUserMedia: Failed to get local stream', error);
            })

        // useEffect return
        return () => {
            if (socket)
                socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h5>Room {roomId}</h5>
            {/* Message Board */}
            <div className="container vh-100">
                <div className="card shadow h-100">
                    <h6 className="card-header bg-success">
                        Messages
                    </h6>
                    <div className="container h-100 bg-dark" style={{ overflowY: 'scroll' }} id="message-board">
                    </div>
                </div>
                <form onSubmit={onMessageSubmit}>
                    <input type="text" onChange={onMessageChange} value={message} />
                    <button className="btn btn-secondary">Send</button>
                </form>
            </div>
            <video id="myVideo" autoPlay={true}></video>
        </div>
    );
}

export default VideoPage;