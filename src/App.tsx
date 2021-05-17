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
                <Route path="/" exact>
                    <HomePage />
                </Route>
                <Route path="/video" exact>
                    <VideoPage />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
