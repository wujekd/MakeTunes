import React from 'react';
import { formatDuration } from '../utils/projectUtils';

const CollabItem = ({ 
    collab, 
    loading, 
    onEdit, 
    onRelease, 
    onDelete 
}) => {

    console.log("collab: ", collab);
    return (
        <div className={`collab-item ${collab.released ? 'released' : 'unreleased'}`}>
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
                            onClick={() => onEdit(collab)}
                            disabled={loading}
                        >
                            Edit
                        </button>
                        <button 
                            className="btn btn-small btn-success"
                            onClick={() => onRelease(collab.id)}
                            disabled={loading}
                        >
                            Release
                        </button>
                        <button 
                            className="btn btn-small btn-danger"
                            onClick={() => onDelete(collab.id)}
                            disabled={loading}
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    <button 
                        className="btn btn-small btn-danger"
                        onClick={() => onDelete(collab.id)}
                        disabled={loading}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

export default CollabItem;