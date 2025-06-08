import React, { useState, useEffect } from 'react';
import './ProjectManagement.css';

const ProjectManagement = ({ project, onProjectUpdated }) => {
    const [collabs, setCollabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingCollab, setEditingCollab] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state for creating/editing collabs
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        submissionDuration: '',
        votingDuration: ''
    });

    useEffect(() => {
        if (project && project.collabs) {
            setCollabs(project.collabs);
        }
    }, [project]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            submissionDuration: '',
            votingDuration: ''
        });
        setEditingCollab(null);
        setShowCreateForm(false);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateCollab = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5242/api/ProjectControllers/${project.id}/collabs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    submissionDuration: formData.submissionDuration ? `${formData.submissionDuration}:00:00` : null,
                    votingDuration: formData.votingDuration ? `${formData.votingDuration}:00:00` : null
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            resetForm();
            onProjectUpdated();
        } catch (err) {
            setError(`Failed to create collab: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditCollab = async (e) => {
        e.preventDefault();
        if (!editingCollab) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${editingCollab.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    submissionDuration: formData.submissionDuration ? `${formData.submissionDuration}:00:00` : null,
                    votingDuration: formData.votingDuration ? `${formData.votingDuration}:00:00` : null,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            resetForm();
            onProjectUpdated();
        } catch (err) {
            setError(`Failed to update collab: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReleaseCollab = async (collabId) => {
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
        } catch (err) {
            setError(`Failed to release collab: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCollab = async (collabId) => {
        if (!confirm('Are you sure you want to delete this collab?')) {
            return;
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
        } catch (err) {
            setError(`Failed to delete collab: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (collab) => {
        setEditingCollab(collab);
        setFormData({
            name: collab.name,
            description: collab.description,
            submissionDuration: collab.submissionDuration ? Math.floor(collab.submissionDuration / 86400) : '',
            votingDuration: collab.votingDuration ? Math.floor(collab.votingDuration / 86400) : ''
        });
        setShowCreateForm(false);
    };

    const formatDuration = (duration) => {
        if (!duration) return 'Not set';
        const days = Math.floor(duration / 86400);
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    return (
        <section className="project-management col-span-5 row-span-3">
            <div className="project-management-header">
                <h2 className="project-management-title">Project Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setShowCreateForm(true);
                        setEditingCollab(null);
                        resetForm();
                    }}
                    disabled={loading}
                >
                    Add New Collab
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* Create/Edit Form */}
            {(showCreateForm || editingCollab) && (
                <form 
                    className="collab-form"
                    onSubmit={editingCollab ? handleEditCollab : handleCreateCollab}
                >
                    <h3>{editingCollab ? 'Edit Collab' : 'Create New Collab'}</h3>
                    
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="submissionDuration">Submission Duration (days):</label>
                        <input
                            type="number"
                            id="submissionDuration"
                            name="submissionDuration"
                            value={formData.submissionDuration}
                            onChange={handleInputChange}
                            min="1"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="votingDuration">Voting Duration (days):</label>
                        <input
                            type="number"
                            id="votingDuration"
                            name="votingDuration"
                            value={formData.votingDuration}
                            onChange={handleInputChange}
                            min="1"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Saving...' : (editingCollab ? 'Update' : 'Create')}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={resetForm}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Collabs List */}
            <div className="collabs-list">
                <h3>Collaborations</h3>
                {collabs.length === 0 ? (
                    <div className="no-collabs">No collaborations found. Create one to get started!</div>
                ) : (
                    collabs.map(collab => (
                        <div key={collab.id} className={`collab-item ${collab.released ? 'released' : 'unreleased'}`}>
                            <div className="collab-info">
                                <h4>{collab.name}</h4>
                                <p>{collab.description}</p>
                                <div className="collab-meta">
                                    <span className={`status ${collab.released ? 'released' : 'unreleased'}`}>
                                        {collab.released ? 'Released' : 'Draft'}
                                    </span>
                                    <span>Stage: {collab.stage}</span>
                                    <span>Submission: {formatDuration(collab.submissionDuration)}</span>
                                    <span>Voting: {formatDuration(collab.votingDuration)}</span>
                                    {collab.completed && <span className="completed">Completed</span>}
                                </div>
                            </div>
                            
                            <div className="collab-actions">
                                {!collab.released ? (
                                    <>
                                        <button 
                                            className="btn btn-small btn-primary"
                                            onClick={() => startEdit(collab)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="btn btn-small btn-success"
                                            onClick={() => handleReleaseCollab(collab.id)}
                                            disabled={loading}
                                        >
                                            Release
                                        </button>
                                        <button 
                                            className="btn btn-small btn-danger"
                                            onClick={() => handleDeleteCollab(collab.id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="btn btn-small btn-danger"
                                        onClick={() => handleDeleteCollab(collab.id)}
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default ProjectManagement; 