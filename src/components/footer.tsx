import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="footer d-flex align-items-center" style={{height: '10vh', backgroundColor: 'black'}}>
            <div className="d-flex container justify-content-between">
                <h6>Monolingo</h6>
                <Link to="/">Back to Homepage</Link>
            </div>
        </footer>
    );
}

export default Footer;