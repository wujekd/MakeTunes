import React from 'react';
import { useParams } from 'react-router-dom';
import InfoTop from '../components/InfoTop';
import Mixer from '../components/Mixer';
import ProjectManagement from '../components/ProjectManagement';
import { AudioProvider } from '../contexts/AudioContext';
import useProject from '../hooks/useProject';
import { getLatestCollab } from '../utils/projectUtils';

const ProjectDetailView = () => {
    const { projectId } = useParams();
    const { project, loading, error, refetchProject } = useProject(projectId);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    const latestCollab = getLatestCollab(project);

    return (
        <AudioProvider>
            <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
                <InfoTop project={project} collab={latestCollab} />
                <ProjectManagement project={project} onProjectUpdated={refetchProject} />
                <Mixer />
            </main>
        </AudioProvider>
    );
};

export default ProjectDetailView; 