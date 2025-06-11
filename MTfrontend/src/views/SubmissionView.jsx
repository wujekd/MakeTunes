import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Mixer from '../components/Mixer';
import InfoTop from '../components/InfoTop';
import Upload from '../components/Upload';
import InactiveCollabDisplay from '../components/InactiveCollabDisplay';
import { AudioProvider, useAudio } from '../contexts/AudioContext';

const SubmissionView = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCollab, setSelectedCollab] = useState(null);
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
                
                // Set the latest collab as selected by default
                if (data.collabs && data.collabs.length > 0) {
                    setSelectedCollab(data.collabs[data.collabs.length - 1]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const handleCollabAdded = () => {
        setLoading(true);
        // Trigger a re-fetch by updating a dependency or call the API directly
        const refetchProject = async () => {
            try {
                const response = await fetch(`http://localhost:5242/api/ProjectControllers/${projectId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProject(data);
                
                // Update selected collab to the latest one if it was the latest before
                if (data.collabs && data.collabs.length > 0) {
                    setSelectedCollab(data.collabs[data.collabs.length - 1]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        refetchProject();
    };

    const handleSelectCollab = (collab) => {
        setSelectedCollab(collab);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    // Get the latest collab for comparison
    const latestCollab = project.collabs && project.collabs.length > 0 
        ? project.collabs[project.collabs.length - 1] 
        : null;

    // Determine if selected collab is the active (latest and not completed) one
    const isActiveCollabSelected = selectedCollab && latestCollab && 
        selectedCollab.id === latestCollab.id && !selectedCollab.completed;

    return (
        <AudioProvider>
            <SubmissionViewContent 
                project={project}
                latestCollab={latestCollab}
                selectedCollab={selectedCollab}
                onSelectCollab={handleSelectCollab}
                onCollabAdded={handleCollabAdded}
                isActiveCollabSelected={isActiveCollabSelected}
            />
        </AudioProvider>
    );
};

// Wrapper component to access audio context
const SubmissionViewContent = ({ 
    project, 
    latestCollab, 
    selectedCollab, 
    onSelectCollab, 
    onCollabAdded,
    isActiveCollabSelected 
}) => {
    const { setBackingTrack } = useAudio();
    const [backingTrackInitialized, setBackingTrackInitialized] = useState(false);

    // Handle backing track loading when switching to active collab
    useEffect(() => {
        if (isActiveCollabSelected && selectedCollab && selectedCollab.audioFilePath && !backingTrackInitialized) {
            console.log('Loading backing track for active collab:', selectedCollab.name);
            setBackingTrack(`http://localhost:5242${selectedCollab.audioFilePath}`);
            setBackingTrackInitialized(true);
        }
    }, [isActiveCollabSelected, selectedCollab, setBackingTrack, backingTrackInitialized]);

    // Reset initialization flag when collab changes
    useEffect(() => {
        setBackingTrackInitialized(false);
    }, [selectedCollab]);

    return (
        <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
            <InfoTop 
                project={project} 
                collab={latestCollab}
                selectedCollab={selectedCollab}
                onSelectCollab={onSelectCollab}
            />
            
            {isActiveCollabSelected ? (
                // Show active collab: Upload component for submissions
                <Upload project={project} onCollabAdded={onCollabAdded} />
            ) : (
                // Show inactive collab: Collab information with audio controls
                <InactiveCollabDisplay selectedCollab={selectedCollab} />
            )}
            
            <Mixer />
        </main>
    );
};

export default SubmissionView; 