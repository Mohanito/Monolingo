import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient, { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
import Peer from 'peerjs';
const ENDPOINT = "http://localhost:3001";

interface PeerProfile {
    username: string,
    stream: MediaStream | null
}

interface PeerConnections {
    [peerId: string]: Peer.MediaConnection
}

const VideoPage: React.FC = (props) => {
    const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>(socketIOClient(ENDPOINT));
    const [roomId] = useState<string>(useParams<{ roomId: string }>().roomId);
    const [message, setMessage] = useState<string>('');
    // Peer.js States
    const [peer] = useState(new Peer());
    const [peerProfiles, setPeerProfiles] = useState<Array<PeerProfile>>([]);
    const peerConnections = useRef<PeerConnections>({});
    // DOM Element Refs
    const messageBoard = useRef<HTMLDivElement>(null);
    const myVideoStream = useRef<MediaStream | null>();

    useEffect(() => {
        peer.on('open', () => {
            // socket emit has to be placed here; otherwise it emits before peer opens
            socket.current.emit('join-room', roomId, peer.id, peer.id);
        });

        socket.current.on('broadcast-message', (username: string, message: string) => {
            appendMessage(`${username} (Original): ${message}`);
        })

        socket.current.on('user-disconnected', (username: string, peerId: string) => {
            appendMessage(`Socket.io: ${username} left.`);
            peerConnections.current[peerId]!.close();
        })

        navigator.mediaDevices.getUserMedia({
            video: { width: 100, height: 100 },
            audio: true
        })
            .then((myStream: MediaStream) => {
                myVideoStream.current = myStream;  // saving stream in ref in order to close after exiting
                const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
                if (myVideo) {
                    myVideo.srcObject = myStream;
                    myVideo.muted = true;
                }

                socket.current.on('user-connected', (username: string, peerId: string) => {
                    appendMessage(`Socket.io: ${username} joined room ${roomId}`);

                    // call new user
                    const mediaConnection = peer.call(peerId, myStream);

                    mediaConnection.on('stream', (remoteStream) => {
                        if (peerProfiles.find((profile) => profile.username === mediaConnection.peer))
                            return;
                        appendPeerProfile(mediaConnection.peer, remoteStream);
                    });

                    mediaConnection.on('close', () => {
                        removePeerProfile(mediaConnection.peer);
                    });

                    peerConnections.current[mediaConnection.peer] = mediaConnection;
                });

                peer.on('call', (mediaConnection) => {
                    mediaConnection.answer(myStream);

                    mediaConnection.on('stream', (remoteStream) => {
                        if (peerProfiles.find((profile) => profile.username === mediaConnection.peer))
                            return;
                        appendPeerProfile(mediaConnection.peer, remoteStream);
                    });

                    mediaConnection.on('close', () => {
                        removePeerProfile(mediaConnection.peer);
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
            if (myVideoStream.current) {
                myVideoStream.current.getTracks().forEach(function (track) {
                    if (track.readyState === 'live') {
                        track.stop();
                    }
                });
            }
        };
    }, []);

    function removePeerProfile(peerId: string) {
        let i = 0, found = false;
        for (; i < peerProfiles.length; i++) {
            if (peerProfiles[i].username === peerId) {
                found = true;
                break;
            }
        }
        if (found) {
            const newPeerProfiles = peerProfiles;
            newPeerProfiles.splice(i, 1);
            setPeerProfiles([...newPeerProfiles]);
        }
        return;
    }

    function appendPeerProfile(username: string, stream: MediaStream) {
        const newPeerProfiles = peerProfiles;
        newPeerProfiles.push({
            username: username,
            stream: stream
        });
        setPeerProfiles([...newPeerProfiles]);
        return;
    }

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

    function renderVideos() {
        console.log('rendering videos...')
        console.log(peerProfiles);
        let videos = [];
        for (let profile of peerProfiles) {
            // const videoId = `video-${profile.username}`;
            const video =
                <div className="col p-0" key={`col-${profile.username}`}>
                    <video key={`video-${profile.username}`} id={`video-${profile.username}`}
                        autoPlay={true}
                        style={{ width: 100, height: 100 }}>
                    </video>
                </div>

            videos.push(video);
        }
        if (videos.length === 0) {
            return <div className="col p-0" style={{ width: 100, height: 100 }}>Waiting for other users to join...</div>
        }
        return (<>
            {videos}
            {renderVideoStreams()}
        </>);
    }

    function renderVideoStreams() {
        setTimeout(() => {
            for (let profile of peerProfiles) {
                const video: HTMLVideoElement | null = document.querySelector(`#video-${profile.username}`);
                if (video) {
                    video.srcObject = profile.stream;
                }
            }
        }, 1000);
    }

    return (
        <div className='row' style={{ minHeight: '100vh' }}>

            <div className='col-md-6 col-lg-9'>
                <h5>Room {roomId}</h5>
                {/* <div className="d-flex justify-content-center"> */}
                <div className="row container-fluid row-cols-1 row-cols-lg-2">
                    <div className="col p-0">
                        <video id="myVideo" autoPlay={true}></video>
                    </div>
                    {renderVideos()}
                </div>
                {/* </div> */}
            </div>

            {/* Message Board */}
            <div className="col p-0">
                <div className="card shadow h-100">
                    <h6 className="card-header bg-success">
                        Messages
                        </h6>
                    <div ref={messageBoard} className="container bg-dark" style={{ overflowY: 'scroll', height: '90%' }}>
                    </div>
                    <form onSubmit={onMessageSubmit}>
                        <input type="text" onChange={onMessageChange} value={message} />
                        <button className="btn btn-secondary">Send</button>
                    </form>
                </div>
            </div>

        </div>
    );
}

export default VideoPage;