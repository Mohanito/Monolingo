import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VideoPage: React.FC = (props) => {
    const [roomId, setRoomId] = useState<String>(useParams<{roomId: string}>().roomId);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: { width: 300, height: 300 },
            audio: true
        })
            .then((stream: MediaStream) => {
                const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
                if (myVideo) {
                    myVideo.srcObject = stream;
                    myVideo.muted = true;
                }
            })
            .catch((error) => {
                console.log('getUserMedia: Failed to get local stream', error);
            })
    }, []);

    return (
        <div>
            <h5>Room {roomId}</h5>
            <video id="myVideo" autoPlay={true}></video>
        </div>
    );
}

export default VideoPage;