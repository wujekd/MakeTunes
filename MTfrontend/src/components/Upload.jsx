import React, { useState, useEffect } from 'react';
import './Upload.css';
import { useAudio } from '../contexts/AudioContext';

const Upload = ({ project, onCollabAdded }) => {
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setBackingTrack, playTrack, submissionVolume } = useAudio();

    // Get the most recent collab
    const mostRecentCollab = project?.collabs?.length > 0 
        ? project.collabs[project.collabs.length - 1]
        : null;

    useEffect(() => {
        if (mostRecentCollab?.audioFilePath) {
            setBackingTrack(`http://localhost:5242${mostRecentCollab.audioFilePath}`);
        }
    }, [mostRecentCollab, setBackingTrack]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioFile(file);
            // Create a URL for the selected file and play it
            const audioUrl = URL.createObjectURL(file);
            playTrack('preview', audioUrl);
        }
    };

    const handleDownloadBackingTrack = async () => {
        if (!mostRecentCollab?.audioFilePath) {
            alert('No backing track available for download');
            return;
        }

        try {
            // Fetch the file as a blob to force download
            const backingTrackUrl = `http://localhost:5242${mostRecentCollab.audioFilePath}`;
            const response = await fetch(backingTrackUrl);
            const blob = await response.blob();
            
            // Create download link with blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mostRecentCollab.name}_backing_track.mp3`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up blob URL
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading backing track:', error);
            alert('Failed to download backing track. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!audioFile) {
            alert('Please select an audio file');
            return;
        }

        if (!mostRecentCollab) {
            alert('No active collab found');
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('audioFile', audioFile);
        formData.append('collabId', mostRecentCollab.id);
        formData.append('volumeOffset', submissionVolume);

        try {
            const response = await fetch(`http://localhost:5242/api/Projects/collabs/${mostRecentCollab.id}/submissions`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to submit audio');
            }

            const newSubmission = await response.json();
            
            // Reset form
            setAudioFile(null);
            
            // Notify parent component to refresh project data
            if (onCollabAdded) {
                onCollabAdded();
            }
            
            alert('Submission successful!');
        } catch (error) {
            console.error('Error submitting audio:', error);
            alert('Failed to submit audio. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mostRecentCollab) {
        return (
            <section className="upload-section col-span-5 row-span-3">
                <div className="upload-placeholder">
                    <h3>No Active Collaboration</h3>
                    <p>There are no active collaborations available for submissions at the moment.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="upload-section col-span-5 row-span-3">
            <div className="upload-content">
                {/* Header Section */}
                <div className="collab-header">
                    <div className="collab-title-section">
                        <h2 className="collab-title">{mostRecentCollab.name}</h2>
                        <p className="collab-description">{mostRecentCollab.description}</p>
                        <div className="collab-meta">
                            <span className="status-badge active">Active Submission</span>
                            {mostRecentCollab.released && (
                                <span className="status-badge released">Released</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="action-cards">
                    {/* Backing Track Card */}
                    <div className="action-card">
                        <div className="card-header">
                            <h3 className="card-title">Backing Track</h3>
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18V5l12-2v13"/>
                                    <circle cx="6" cy="18" r="3"/>
                                    <circle cx="18" cy="16" r="3"/>
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            {mostRecentCollab.audioFilePath ? (
                                <div>
                                    <div className="audio-status available">
                                        <div className="status-indicator"></div>
                                        <span>Backing track loaded in mixer</span>
                                    </div>
                                    <button
                                        onClick={handleDownloadBackingTrack}
                                        className="download-btn"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7,10 12,15 17,10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                        Download Track
                                    </button>
                                </div>
                            ) : (
                                <div className="audio-status unavailable">
                                    <span>No backing track available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Card */}
                    <div className="action-card">
                        <div className="card-header">
                            <h3 className="card-title">Your Submission</h3>
                            <div className="card-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14,2 14,8 20,8"/>
                                    <line x1="16" y1="13" x2="8" y2="13"/>
                                    <line x1="16" y1="17" x2="8" y2="17"/>
                                    <polyline points="10,9 9,9 8,9"/>
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            <form onSubmit={handleSubmit} className="upload-form">
                                <div className="file-input-section">
                                    <label htmlFor="audioFile" className="file-label">
                                        Select Audio File
                                    </label>
                                    <input
                                        type="file"
                                        id="audioFile"
                                        accept="audio/*"
                                        onChange={handleFileChange}
                                        className="file-input"
                                        required
                                    />
                                    {audioFile && (
                                        <div className="file-info">
                                            <span className="file-name">{audioFile.name}</span>
                                            <span className="volume-info">
                                                Volume: {submissionVolume.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="17,8 12,3 7,8"/>
                                                <line x1="12" y1="3" x2="12" y2="15"/>
                                            </svg>
                                            Submit Contribution
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Upload; 