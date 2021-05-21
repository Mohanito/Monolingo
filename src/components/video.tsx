import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3001";

const VideoPage: React.FC = (props) => {
    const [roomId, setRoomId] = useState<String>(useParams<{ roomId: string }>().roomId);

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        socket.emit('join-room', roomId);
        socket.on('user-connected', () => {
            console.log(`Socket.io: A user joined room ${roomId}`);
        });
        // navigator.mediaDevices.getUserMedia({
        //     video: { width: 300, height: 300 },
        //     audio: true
        // })
        //     .then((stream: MediaStream) => {
        //         const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
        //         if (myVideo) {
        //             myVideo.srcObject = stream;
        //             myVideo.muted = true;
        //         }
        //     })
        //     .catch((error) => {
        //         console.log('getUserMedia: Failed to get local stream', error);
        //     })
    });

    return (
        <div>
            <h5>Room {roomId}</h5>
            <video id="myVideo" autoPlay={true}></video>
        </div>
    );
}

export default VideoPage;