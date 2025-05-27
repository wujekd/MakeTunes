import React, { useState, useEffect } from 'react';
import './Upload.css';
import { useAudio } from '../contexts/AudioContext';

const Upload = ({ project, onCollabAdded }) => {
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionCount, setSubmissionCount] = useState(0);
    const { setBackingTrack } = useAudio();

    // Get the most recent collab
    const mostRecentCollab = project?.collabs?.length > 0 
        ? project.collabs[project.collabs.length - 1]
        : null;

    useEffect(() => {
        if (mostRecentCollab) {
            // Set the backing track in the mixer
            if (mostRecentCollab.audioFilePath) {
                setBackingTrack(`http://localhost:5242${mostRecentCollab.audioFilePath}`);
            }
            
            // Get submission count
            const fetchSubmissionCount = async () => {
                try {
                    const response = await fetch(`http://localhost:5242/api/projects/collabs/${mostRecentCollab.id}/submissions`);
                    if (response.ok) {
                        const submissions = await response.json();
                        setSubmissionCount(submissions.length);
                    }
                } catch (error) {
                    console.error('Error fetching submissions:', error);
                }
            };
            
            fetchSubmissionCount();
        }
    }, [mostRecentCollab, setBackingTrack]);

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

        try {
            const response = await fetch(`http://localhost:5242/api/projects/collabs/${mostRecentCollab.id}/submissions`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to submit audio');
            }

            const newSubmission = await response.json();
            
            // Reset form
            setAudioFile(null);
            
            // Update submission count
            setSubmissionCount(prev => prev + 1);
            
            // Notify parent component to refresh project data
            if (onCollabAdded) {
                onCollabAdded();
            }
            
            alert('Submission successful!');
        } catch (error) {
            console.error('Error submitting audio:', error);
            alert(error.message || 'Failed to submit audio. Please try again.');
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
                    <p><strong>Submissions:</strong> {submissionCount}</p>
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
                            onChange={(e) => setAudioFile(e.target.files[0])}
                            className="mt-1 block w-full"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
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