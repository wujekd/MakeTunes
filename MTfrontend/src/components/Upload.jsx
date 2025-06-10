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

    return (
        <section className="upload-section col-span-5 row-span-3">
            <h2 className="upload-title">Upload Your Submission</h2>
            {mostRecentCollab && (
                <div className="current-collab-info mb-4">
                    <h3 className="text-lg font-semibold">Current Collab Details:</h3>
                    <p><strong>Name:</strong> {mostRecentCollab.name}</p>
                    <p><strong>Description:</strong> {mostRecentCollab.description}</p>
                    {mostRecentCollab.audioFilePath && (
                        <div className="mt-3">
                            <button
                                onClick={handleDownloadBackingTrack}
                                className="download-btn"
                            >
                                📥 Download Backing Track
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="upload-container">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="audioFile" className="block text-sm font-medium">Your Audio Submission:</label>
                        <input
                            type="file"
                            id="audioFile"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full"
                            required
                        />
                    </div>
                    {audioFile && (
                        <div className="text-sm text-gray-600">
                            Current Volume Offset: {submissionVolume.toFixed(2)}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Upload; 