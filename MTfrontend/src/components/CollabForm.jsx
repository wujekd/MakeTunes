import React from 'react';

const CollabForm = ({ 
    formData, 
    isEditing, 
    loading, 
    currentAudioFile,
    onInputChange, 
    onFileChange,
    onSubmit, 
    onCancel 
}) => {
    return (
        <form className="collab-form" onSubmit={onSubmit}>
            <h3>{isEditing ? 'Edit Collab' : 'Create New Collab'}</h3>
            
            <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
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
                    onChange={onInputChange}
                    required
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label htmlFor="audioFile">
                    Audio File {isEditing ? '(replace current file)' : '(optional)'}:
                </label>
                
                {isEditing && currentAudioFile && (
                    <div className="current-file-info">
                        <span className="current-file-label">Current file:</span>
                        <span className="current-file-name">
                            {currentAudioFile.split('/').pop()?.split('_').slice(1).join('_') || 'Unknown file'}
                        </span>
                    </div>
                )}
                
                <input
                    type="file"
                    id="audioFile"
                    name="audioFile"
                    accept="audio/*"
                    onChange={onFileChange}
                    disabled={loading}
                />
                <small className="form-hint">
                    {isEditing 
                        ? 'Upload a new audio file to replace the current one. Leave empty to keep the current file.'
                        : 'Upload an audio file to serve as the base track for this collaboration.'
                    }
                </small>
            </div>

            <div className="form-group">
                <label htmlFor="submissionDuration">Submission Duration (days):</label>
                <input
                    type="number"
                    id="submissionDuration"
                    name="submissionDuration"
                    value={formData.submissionDuration}
                    onChange={onInputChange}
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
                    onChange={onInputChange}
                    min="1"
                    disabled={loading}
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </button>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default CollabForm; 