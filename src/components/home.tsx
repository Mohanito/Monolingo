import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { v4 as uuid } from 'uuid';


const HomePage: React.FC<RouteComponentProps> = (props) => {

    const [roomId, setRoomId] = useState<String>('');

    const createRoom = () => {
        props.history.push(`/video/${uuid()}`);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        props.history.push(`/video/${roomId}`);
    }

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setRoomId(e.currentTarget.value);
    }

    return (
        <div className="container">
            <p>Home page</p>
            <button onClick={createRoom} className="btn btn-secondary">
                Create Random Room ID
            </button>
            <form onSubmit={handleSubmit}>
                <label htmlFor="roomId">Enter Room ID</label>
                <input type="text" id="roomId" onChange={handleChange}></input>
                <button className="btn btn-secondary">Join Room</button>
            </form>
        </div>
    );
}

export default HomePage;