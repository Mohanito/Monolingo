import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return <footer className="footer d-flex align-items-center">
        <div className="d-flex container justify-content-between">
            <h6>Monolingo</h6>
            <Link to="/">Home</Link>
            {/* <h6><a href="/">Back to Homepage</a></h6> */}
        </div>
    </footer>
}

export default Footer;