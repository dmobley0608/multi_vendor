import { useState, useEffect } from 'react';

const useGitHubLastUpdate = (owner, repo) => {
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                const data = await response.json();
                const date = new Date(data.pushed_at);
                setLastUpdate(date);
            } catch (error) {
                console.error('Error fetching GitHub data:', error);
            }
        };

        fetchLastUpdate();
    }, [owner, repo]);

    return lastUpdate;
};

export default useGitHubLastUpdate;
