import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return <nav>
        <Link to="/">Home</Link>
        <Link to="/video">Video</Link>
    </nav>
}

export default Header;