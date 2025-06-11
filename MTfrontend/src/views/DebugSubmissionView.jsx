import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DebugAudioProvider, useDebugAudio } from '../contexts/DebugAudioContext';

const DebugSubmissionView = () => {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!project) return null;

    return (
        <DebugAudioProvider>
            <DebugSubmissionContent 
                project={project}
                selectedCollab={selectedCollab}
                setSelectedCollab={setSelectedCollab}
            />
        </DebugAudioProvider>
    );
};

const DebugSubmissionContent = ({ project, selectedCollab, setSelectedCollab }) => {
    const { isPlaying, error, loadBackingTrack, loadSubmission, togglePlay } = useDebugAudio();
    const [submissions, setSubmissions] = useState([]);

    // Load backing track when collab changes
    useEffect(() => {
        if (selectedCollab?.audioFilePath) {
            const backingUrl = `http://localhost:5242${selectedCollab.audioFilePath}`;
            console.log('[DebugView] Loading backing track for:', selectedCollab.name);
            loadBackingTrack(backingUrl);
        }
    }, [selectedCollab, loadBackingTrack]);

    // Fetch submissions for the selected collab
    useEffect(() => {
        if (!selectedCollab) return;
        
        const fetchSubmissions = async () => {
            try {
                const response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${selectedCollab.id}/submissions`);
                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                    console.log('[DebugView] Submissions loaded:', data.length);
                }
            } catch (err) {
                console.error('[DebugView] Error fetching submissions:', err);
            }
        };
        
        fetchSubmissions();
    }, [selectedCollab]);

    const winningSubmission = submissions.find(sub => sub.final);

    const handlePlayWinningSubmission = () => {
        if (winningSubmission?.audioFilePath) {
            const submissionUrl = `http://localhost:5242${winningSubmission.audioFilePath}`;
            console.log('[DebugView] Loading winning submission');
            loadSubmission(submissionUrl);
        }
    };

    return (
        <div className="debug-submission-view" style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
            <h1>Debug Audio Player</h1>
            
            {/* Project Info */}
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #333' }}>
                <h2>Project: {project.name}</h2>
                <p>{project.description}</p>
            </div>

            {/* Collab Selection */}
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #333' }}>
                <h3>Select Collab:</h3>
                {project.collabs?.map(collab => (
                    <button
                        key={collab.id}
                        onClick={() => setSelectedCollab(collab)}
                        style={{
                            margin: '5px',
                            padding: '10px',
                            backgroundColor: selectedCollab?.id === collab.id ? '#444' : '#222',
                            color: 'white',
                            border: '1px solid #555',
                            cursor: 'pointer'
                        }}
                    >
                        {collab.name} ({collab.completed ? 'Completed' : 'Active'})
                    </button>
                ))}
            </div>

            {/* Selected Collab Info */}
            {selectedCollab && (
                <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #333' }}>
                    <h3>Selected Collab: {selectedCollab.name}</h3>
                    <p>Description: {selectedCollab.description}</p>
                    <p>Backing Track: {selectedCollab.audioFilePath ? 'Available' : 'None'}</p>
                    <p>Submissions: {submissions.length}</p>
                    {winningSubmission && (
                        <p>Winning Submission: {winningSubmission.audioFilePath ? 'Available' : 'None'}</p>
                    )}
                </div>
            )}

            {/* Audio Controls */}
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #333' }}>
                <h3>Audio Controls</h3>
                
                <div style={{ marginBottom: '10px' }}>
                    <button
                        onClick={handlePlayWinningSubmission}
                        disabled={!winningSubmission?.audioFilePath}
                        style={{
                            padding: '10px 20px',
                            marginRight: '10px',
                            backgroundColor: '#444',
                            color: 'white',
                            border: '1px solid #555',
                            cursor: 'pointer'
                        }}
                    >
                        Load Winning Submission
                    </button>
                    
                    <button
                        onClick={togglePlay}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isPlaying ? '#d33' : '#3d3',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>

                <div>
                    <strong>Status:</strong> {isPlaying ? 'Playing' : 'Stopped'}
                </div>
                
                {error && (
                    <div style={{ color: '#ff6666', marginTop: '10px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
            </div>

            {/* Debug Info */}
            <div style={{ padding: '10px', border: '1px solid #333', fontSize: '12px', fontFamily: 'monospace' }}>
                <h4>Debug Info:</h4>
                <p>Selected Collab ID: {selectedCollab?.id}</p>
                <p>Backing Track Path: {selectedCollab?.audioFilePath}</p>
                <p>Winning Submission Path: {winningSubmission?.audioFilePath}</p>
                <p>Is Playing: {isPlaying.toString()}</p>
                <p>Error: {error || 'None'}</p>
            </div>
        </div>
    );
};

export default DebugSubmissionView; 