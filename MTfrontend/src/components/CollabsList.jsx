import React from 'react';
import CollabItem from './CollabItem';

const CollabsList = ({ 
    collabs, 
    loading, 
    onEdit, 
    onRelease, 
    onDelete 
}) => {
    return (
        <div className="collabs-list">
            <h3>Collaborations</h3>
            {collabs.length === 0 ? (
                <div className="no-collabs">
                    No collaborations found. Create one to get started!
                </div>
            ) : (
                collabs.map(collab => (
                    <CollabItem
                        key={collab.id}
                        collab={collab}
                        loading={loading}
                        onEdit={onEdit}
                        onRelease={onRelease}
                        onDelete={onDelete}
                    />
                ))
            )}
        </div>
    );
};

export default CollabsList; 