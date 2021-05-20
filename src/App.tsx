import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Header from './components/header';

import HomePage from './components/home';
import VideoPage from './components/video';

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/video/:roomId" component={VideoPage} />
            </Switch>
        </Router>
    );
}

export default App;
