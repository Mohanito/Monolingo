import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage: React.FC = () => {

    const [response, setResponse] = useState<String>('waiting for api response');

    useEffect(() => {
        axios.get('/api')
            .then((res) => {
                setResponse(res.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    return (
        <div>
            Home page
            <p>{response}</p>
        </div>
    );
}

export default HomePage;