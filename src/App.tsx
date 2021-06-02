import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './components/navbar';

import HomePage from './components/home';
import VideoPage from './components/video';
import Footer from './components/footer';

const App: React.FC = () => {
    return (
        <Router>
            <Navbar />
            <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/video/:roomId" component={VideoPage} />
            </Switch>
            <Footer />
        </Router>
    );
}

export default App;
