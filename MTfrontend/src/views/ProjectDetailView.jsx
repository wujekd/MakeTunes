import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfoTop from '../components/InfoTop';
import Mixer from '../components/Mixer';
import ProjectManagement from '../components/ProjectManagement';
import { AudioProvider } from '../contexts/AudioContext';

const ProjectDetailView = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
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

        fetchProject();
    }, [projectId, navigate]);

    const handleProjectUpdated = () => {
        setLoading(true);
        const refetchProject = async () => {
            try {
                const response = await fetch(`http://localhost:5242/api/ProjectControllers/${projectId}`);
                if (!response.ok) {
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
        refetchProject();
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    // Get the latest collab for the InfoTop component
    const latestCollab = project.collabs && project.collabs.length > 0 
        ? project.collabs[project.collabs.length - 1] 
        : null;

    return (
        <AudioProvider>
            <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
                <InfoTop project={project} collab={latestCollab} />
                <ProjectManagement project={project} onProjectUpdated={handleProjectUpdated} />
                <Mixer />
            </main>
        </AudioProvider>
    );
};

export default ProjectDetailView; 