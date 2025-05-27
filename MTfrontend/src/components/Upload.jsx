import React, { useState, useEffect } from 'react';
import './Upload.css';
import { useAudio } from '../contexts/AudioContext';
import { useNavigate } from 'react-router-dom';

const Upload = ({ project, onCollabAdded }) => {
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { setBackingTrack, playTrack, submissionVolume, setSubmissionVolume } = useAudio();
    const navigate = useNavigate();

    // Get the most recent collab
    const mostRecentCollab = project?.collabs?.length > 0 
        ? project.collabs[project.collabs.length - 1]
        : null;

    useEffect(() => {
        if (mostRecentCollab && mostRecentCollab.audioFilePath) {
            // Set the backing track in the mixer
            setBackingTrack(`http://localhost:5242${mostRecentCollab.audioFilePath}`);
        }
    }, [mostRecentCollab, setBackingTrack]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAudioFile(file);
            const url = URL.createObjectURL(file);
            // Load the file into the audio context for preview
            playTrack('preview', url);
            // Reset volume to default when new file is selected
            setSubmissionVolume(1.0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!audioFile || !mostRecentCollab) return;

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('collabId', mostRecentCollab.id);
        formData.append('volumeOffset', submissionVolume.toString());

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/submissions`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload submission');
            }
            
            // Clear the form
            setAudioFile(null);
            
            // Navigate back to project view
            navigate(`/project/${mostRecentCollab.projectId}`);
            
            // Notify parent component to refresh project data
            if (onCollabAdded) {
                onCollabAdded();
            }
        } catch (err) {
            setError(err.message);
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
                            onChange={handleFileSelect}
                            className="mt-1 block w-full"
                            required
                        />
                    </div>
                    {audioFile && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Current Volume: {(submissionVolume * 100).toFixed(0)}%
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="text-red-600 text-sm mt-2">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={!audioFile || isSubmitting}
                    >
                        {isSubmitting ? 'Uploading...' : 'Submit'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Upload; 