import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Mixer from '../components/Mixer';
import InfoTop from '../components/InfoTop';
import Upload from '../components/Upload';
import { AudioProvider } from '../contexts/AudioContext';

const SubmissionView = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:5242/api/projects/${projectId}`);
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
        fetchProject();
    }, [projectId, navigate]);

    const handleCollabAdded = () => {
        fetchProject(); // Refresh project data after new collab is added
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    return (
        <AudioProvider>
            <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
                <InfoTop project={project} />
                <Upload project={project} onCollabAdded={handleCollabAdded} />
                <Mixer />
            </main>
        </AudioProvider>
    );
};

export default SubmissionView; 