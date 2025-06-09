import { useState } from 'react';

const useCollabOperations = (projectId, onProjectUpdated) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    const createCollab = async (formData, audioFile) => {
        setLoading(true);
        setError(null);

        try {
            // Create FormData for file upload
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('description', formData.description);
            
            if (formData.submissionDuration) {
                formDataObj.append('submissionDuration', `${formData.submissionDuration}.00:00:00`);
            }
            
            if (formData.votingDuration) {
                formDataObj.append('votingDuration', `${formData.votingDuration}.00:00:00`);
            }
            
            if (audioFile) {
                formDataObj.append('audioFile', audioFile);
            }

            const response = await fetch(`http://localhost:5242/api/ProjectControllers/${projectId}/collabs`, {
                method: 'POST',
                body: formDataObj, // Send FormData, no Content-Type header needed
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            onProjectUpdated();
            return true;
        } catch (err) {
            setError(`Failed to create collab: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateCollab = async (collabId, formData, audioFile) => {
        setLoading(true);
        setError(null);

        try {
            let response;
            
            if (audioFile) {
                // Use FormData when there's a file to upload
                const formDataObj = new FormData();
                formDataObj.append('name', formData.name);
                formDataObj.append('description', formData.description);
                
                if (formData.submissionDuration) {
                    formDataObj.append('submissionDuration', `${formData.submissionDuration}.00:00:00`);
                }
                
                if (formData.votingDuration) {
                    formDataObj.append('votingDuration', `${formData.votingDuration}.00:00:00`);
                }
                
                formDataObj.append('audioFile', audioFile);

                response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${collabId}/with-file`, {
                    method: 'PUT',
                    body: formDataObj,
                });
            } else {
                // Use JSON when there's no file to upload
                response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${collabId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        description: formData.description,
                        submissionDuration: formData.submissionDuration ? `${formData.submissionDuration}.00:00:00` : null,
                        votingDuration: formData.votingDuration ? `${formData.votingDuration}.00:00:00` : null,
                    }),
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            onProjectUpdated();
            return true;
        } catch (err) {
            setError(`Failed to update collab: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const releaseCollab = async (collabId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${collabId}/release`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            onProjectUpdated();
            return true;
        } catch (err) {
            setError(`Failed to release collab: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteCollab = async (collabId) => {
        if (!confirm('Are you sure you want to delete this collab?')) {
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${collabId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            onProjectUpdated();
            return true;
        } catch (err) {
            setError(`Failed to delete collab: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        clearError,
        createCollab,
        updateCollab,
        releaseCollab,
        deleteCollab
    };
};

export default useCollabOperations; 