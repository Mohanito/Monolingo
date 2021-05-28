import React, { useState, useEffect, useRef } from 'react';
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

interface PeerConnections {
    [peerId: string]: Peer.MediaConnection
}

const VideoPage: React.FC = (props) => {
    const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>(socketIOClient(ENDPOINT));
    const [roomId] = useState<string>(useParams<{ roomId: string }>().roomId);
    const [message, setMessage] = useState<string>('');
    const [peer] = useState(new Peer());
    const [peerProfiles] = useState<PeerProfiles>({});
    const peerConnections = useRef<PeerConnections>({});
    const messageBoard = useRef<HTMLDivElement>(null);
    // const myStream = useRef<MediaStream | null>();

    function appendMessage(message: string) {    //, style = undefined
        const msg = document.createElement('p');
        msg.textContent = message;
        if (messageBoard.current !== null) {
            messageBoard.current.append(msg);
            messageBoard.current.scrollTop = messageBoard.current.scrollHeight; // auto scroll
        }
    }

    function onMessageChange(e: React.FormEvent<HTMLInputElement>) {
        setMessage(e.currentTarget.value);
    }

    function onMessageSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (message !== '') {
            appendMessage(message);
            if (socket !== null) {
                socket.current.emit('send-message', message);
            }
        }
        setMessage('');
    }

    useEffect(() => {
        peer.on('open', () => {
            // socket emit has to be placed here; otherwise it emits before peer opens
            socket.current.emit('join-room', roomId, 'dummy-username', peer.id);
        });

        socket.current.on('broadcast-message', (username: string, message: string) => {
            appendMessage(`${username} (Original): ${message}`);
        })

        socket.current.on('user-disconnected', (username: string, peerId: string) => {
            appendMessage(`Socket.io: ${username} left.`);
            peerConnections.current[peerId]!.close();
        })

        navigator.mediaDevices.getUserMedia({
            video: { width: 50, height: 50 },
            audio: true
        })
            .then((myStream: MediaStream) => {
                // myStream.current = stream;
                const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
                if (myVideo) {
                    myVideo.srcObject = myStream;
                    myVideo.muted = true;
                }

                socket.current.on('user-connected', (username: string, peerId: string) => {
                    appendMessage(`Socket.io: ${username} joined room ${roomId}`);
                    peerProfiles[peerId] = {
                        username: username
                    };
                    // call new user
                    const mediaConnection = peer.call(peerId, myStream);

                    // onStream(mediaConnection, peerId);
                    mediaConnection.on('stream', (remoteStream) => {
                        const video2: HTMLVideoElement | null = document.querySelector('#video2');
                        if (video2)
                            video2.srcObject = remoteStream;
                    });

                    // onClose(mediaConnection, peerId);
                    mediaConnection.on('close', () => {
                        document.getElementById('video2')!.remove(); //`col-${peerId}`
                    });

                    peerConnections.current[mediaConnection.peer] = mediaConnection;
                });

                peer.on('call', (mediaConnection) => {
                    mediaConnection.answer(myStream);

                    // onStream(mediaConnection, peerId);
                    mediaConnection.on('stream', (remoteStream) => {
                        const video2: HTMLVideoElement | null = document.querySelector('#video2');
                        if (video2)
                            video2.srcObject = remoteStream;
                    });

                    // onClose(mediaConnection, peerId);
                    mediaConnection.on('close', () => {
                        document.getElementById('video2')!.remove(); //`col-${peerId}`
                    });

                    peerConnections.current[mediaConnection.peer] = mediaConnection;
                })
            })
            .catch((error) => {
                console.log('getUserMedia: Failed to get local stream', error);
            })

        // useEffect return
        return () => {
            if (socket)
                socket.current.disconnect();
        };
    }, []);

    return (
        <div>
            <h5>Room {roomId}</h5>
            {/* Video list */}
            <div className="container">
                <video id="myVideo" autoPlay={true}></video>
                <video id="video2" autoPlay={true}></video>
            </div>

            {/* Message Board */}
            <div className="container vh-100">
                <div className="card shadow h-100">
                    <h6 className="card-header bg-success">
                        Messages
                    </h6>
                    <div ref={messageBoard} className="container h-100 bg-dark" style={{ overflowY: 'scroll' }}>
                    </div>
                </div>
                <form onSubmit={onMessageSubmit}>
                    <input type="text" onChange={onMessageChange} value={message} />
                    <button className="btn btn-secondary">Send</button>
                </form>
            </div>

        </div>
    );
}

export default VideoPage;