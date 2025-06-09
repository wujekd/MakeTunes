import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useProject = (projectId) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProject = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:5242/api/ProjectControllers/${projectId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    navigate('/projects');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setProject(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId, navigate]);

    const refetchProject = () => {
        fetchProject();
    };

    return {
        project,
        loading,
        error,
        refetchProject
    };
};

export default useProject; 