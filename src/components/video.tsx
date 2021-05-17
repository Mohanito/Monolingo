import React, { useEffect } from 'react';

const VideoPage: React.FC = () => {

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: { width: 600, height: 400 },
            audio: true
        })
            .then((stream) => {
                const myVideo: HTMLVideoElement | null = document.querySelector('#myVideo');
                if (myVideo) {
                    myVideo.srcObject = stream;
                    myVideo.muted = true;
                }
            })
            .catch((error) => {
                console.log('getUserMedia: Failed to get local stream', error);
            })
    }, [])

    return (
        <div>
            <video id="myVideo" autoPlay={true}></video>
        </div>
    );
}

export default VideoPage;