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
    const [peerProfiles, setPeerProfiles] = useState<PeerProfiles>({});
    const peerConnections = useRef<PeerConnections>({});
    const messageBoard = useRef<HTMLDivElement>(null);
    const videoContainer = useRef<HTMLDivElement>(null);
    const peerList = useRef<Array<string>>([]);
    const myVideoStream = useRef<MediaStream | null>();

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
                        if (peerList.current.find((elem) => elem === mediaConnection.peer))
                            return;
                        console.log('executed 1');
                        let newPeerProfiles: PeerProfiles = { ...peerProfiles };
                        newPeerProfiles[peerId] = {
                            username: username,
                            stream: remoteStream
                        };
                        setPeerProfiles(newPeerProfiles);
                        peerList.current.push(mediaConnection.peer);
                    });

                    mediaConnection.on('close', () => {
                        // document.getElementById('video2')!.remove(); //`col-${peerId}`
                        let newPeerProfiles: PeerProfiles = { ...peerProfiles };
                        delete (newPeerProfiles[mediaConnection.peer])
                        // remove from peerList
                        const index = peerList.current.indexOf(mediaConnection.peer);
                        if (index > -1) {
                            peerList.current.splice(index, 1);
                        }
                        setPeerProfiles(newPeerProfiles);
                    });

                    peerConnections.current[mediaConnection.peer] = mediaConnection;
                });

                peer.on('call', (mediaConnection) => {
                    mediaConnection.answer(myStream);

                    mediaConnection.on('stream', (remoteStream) => {
                        if (peerList.current.find((elem) => elem === mediaConnection.peer))
                            return;
                        console.log('executed 1');
                        let newPeerProfiles: PeerProfiles = { ...peerProfiles };
                        newPeerProfiles[mediaConnection.peer] = {
                            username: mediaConnection.peer,
                            stream: remoteStream
                        };
                        setPeerProfiles(newPeerProfiles);
                        peerList.current.push(mediaConnection.peer);
                    });

                    mediaConnection.on('close', () => {
                        // document.getElementById('video2')!.remove(); //`col-${peerId}`
                        let newPeerProfiles: PeerProfiles = { ...peerProfiles };
                        delete (newPeerProfiles[mediaConnection.peer]);
                        setPeerProfiles(newPeerProfiles);
                        // remove from peerList
                        const index = peerList.current.indexOf(mediaConnection.peer);
                        if (index > -1) {
                            peerList.current.splice(index, 1);
                        }
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
                myVideoStream.current.getTracks().forEach(function(track) {
                    if (track.readyState == 'live') {
                        track.stop();
                    }
                });
            } 
        };
    }, []);

    function renderVideos() {
        let videos = [];
        for (let key in peerProfiles) {
            const videoId = `video-${key}`;
            const video = 
                <video key={videoId} id={videoId} autoPlay={true} style={{ width: 100, height: 100 }}></video>
            
            videos.push(video);
        }
        return (
            <div className="container">
                <p>Video list render</p>
                {videos}
            </div>
        );
    }

    function renderVideoStreams() {
        setTimeout(() => {
            for (let key in peerProfiles) {
                // console.log('searching video element... render video streams')
                const video: HTMLVideoElement | null = document.querySelector(`#video-${key}`);
                if (video) {
                    // console.log('found one video in renderVideoStreams')
                    video.srcObject = peerProfiles[key].stream;
                }
            }
        }, 1000);
    }

    return (
        <div className='row' style={{minHeight: '90vh'}}>
            <h5>Room {roomId}</h5>
            {/* Video list */}
            <div className="container" ref={videoContainer}>
                <div className="p">myvideo</div>
                <video id="myVideo" autoPlay={true}></video>
            </div>

            {renderVideos()}
            {renderVideoStreams()}

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