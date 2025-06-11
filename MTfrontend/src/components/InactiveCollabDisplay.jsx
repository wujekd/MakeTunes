import React, { useState, useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './InactiveCollabDisplay.css';

const InactiveCollabDisplay = ({ selectedCollab }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [backingTrackInitialized, setBackingTrackInitialized] = useState(false);
    const { setBackingTrack, playTrack, isPlaying, togglePlay } = useAudio();
    
    useEffect(() => {
        if (!selectedCollab) return;
        
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${selectedCollab.id}/submissions`);
                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                }
            } catch (err) {
                console.error('Error fetching submissions:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubmissions();
    }, [selectedCollab]);

    // Reset audio and load backing track when collab changes
    useEffect(() => {
        if (!selectedCollab) return;
        
        // Stop current playback if playing
        if (isPlaying) {
            togglePlay();
        }
        
        // Reset audio loaded state
        setAudioLoaded(false);
        setBackingTrackInitialized(false);
        
        // Load backing track for the new collab
        if (selectedCollab.audioFilePath && !backingTrackInitialized) {
            console.log('Loading backing track for collab:', selectedCollab.name);
            setBackingTrack(`http://localhost:5242${selectedCollab.audioFilePath}`);
            setBackingTrackInitialized(true);
        }
    }, [selectedCollab, isPlaying, togglePlay, setBackingTrack, backingTrackInitialized]);
    
    if (!selectedCollab) {
        return (
            <section className="inactive-collab-display col-span-5 row-span-3">
                <div className="inactive-collab-placeholder">
                    <h3>Select a collab to view its information</h3>
                    <p>Choose a collaboration from the history to see details, audio, and statistics.</p>
                </div>
            </section>
        );
    }
    
    const winningSubmission = submissions.find(sub => sub.final);

    const handlePlayPause = () => {
        if (!audioLoaded) {
            // First time playing - load the winning submission if available
            if (winningSubmission && winningSubmission.audioFilePath) {
                console.log('Loading winning submission for playback:', winningSubmission.audioFilePath);
                playTrack(`collab-${selectedCollab.id}-winner`, `http://localhost:5242${winningSubmission.audioFilePath}`);
            }
            
            setAudioLoaded(true);
        } else {
            // Audio already loaded, just toggle play/pause
            togglePlay();
        }
    };

    // Determine if audio can be played
    const hasAudio = selectedCollab.audioFilePath || (winningSubmission && winningSubmission.audioFilePath);
    
    return (
        <section className="inactive-collab-display col-span-5 row-span-3">
            <div className="inactive-collab-content">
                {/* Header Section */}
                <div className="collab-header">
                    <div className="collab-title-section">
                        <h2 className="collab-title">{selectedCollab.name}</h2>
                        <p className="collab-description">{selectedCollab.description}</p>
                        <div className="collab-meta">
                            <span className={`status-badge ${selectedCollab.completed ? 'completed' : 'active'}`}>
                                {selectedCollab.completed ? 'Completed' : selectedCollab.stage}
                            </span>
                            {selectedCollab.released && (
                                <span className="status-badge released">Released</span>
                            )}
                        </div>
                    </div>
                    
                    {hasAudio && (
                        <div className="play-button-section">
                            <button 
                                onClick={handlePlayPause}
                                className={`play-button ${audioLoaded && isPlaying ? 'playing' : ''}`}
                            >
                                <div className="play-icon">
                                    {audioLoaded && isPlaying ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" rx="1"/>
                                            <rect x="14" y="4" width="4" height="16" rx="1"/>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </div>
                                <span className="play-text">
                                    {audioLoaded && isPlaying ? 'Pause' : 'Play'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* Audio Information Cards */}
                <div className="audio-cards">
                    <div className="audio-card">
                        <div className="card-header">
                            <h3 className="card-title">Backing Track</h3>
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polygon points="10,8 16,12 10,16 10,8"/>
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            {selectedCollab.audioFilePath ? (
                                <div className="audio-status available">
                                    <div className="status-indicator"></div>
                                    <span>Loaded - plays with submission</span>
                                </div>
                            ) : (
                                <div className="audio-status unavailable">
                                    <span>No backing track available</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="audio-card">
                        <div className="card-header">
                            <h3 className="card-title">Winning Submission</h3>
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            {loading ? (
                                <div className="loading-state">
                                    <div className="loading-spinner"></div>
                                    <span>Loading submissions...</span>
                                </div>
                            ) : winningSubmission ? (
                                <div>
                                    <div className="audio-status available">
                                        <div className="status-indicator"></div>
                                        <span>Ready to play - use play button above</span>
                                    </div>
                                    <div className="submission-details">
                                        <span className="detail-label">Volume Offset:</span>
                                        <span className="detail-value">{winningSubmission.volumeOffset}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="audio-status unavailable">
                                    <span>
                                        {selectedCollab.completed ? 'No winning submission found' : 'Collab not yet completed'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Statistics Section */}
                {submissions.length > 0 && (
                    <div className="statistics-section">
                        <h3 className="section-title">Collaboration Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-number total">{submissions.length}</div>
                                <div className="stat-label">Total Submissions</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number favorited">
                                    {submissions.filter(sub => sub.favorited).length}
                                </div>
                                <div className="stat-label">Favorited</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number listened">
                                    {submissions.filter(sub => sub.listened).length}
                                </div>
                                <div className="stat-label">Listened</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default InactiveCollabDisplay; 