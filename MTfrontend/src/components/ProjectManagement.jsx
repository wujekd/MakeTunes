import React, { useState, useEffect } from 'react';
import './ProjectManagement.css';
import ErrorMessage from './ErrorMessage';
import CollabForm from './CollabForm';
import CollabsList from './CollabsList';
import useCollabOperations from '../hooks/useCollabOperations';
import useCollabForm from '../hooks/useCollabForm';

const ProjectManagement = ({ project, onProjectUpdated }) => {
    const [collabs, setCollabs] = useState([]);
    
    // Custom hooks for operations and form management
    const { loading, error, createCollab, updateCollab, releaseCollab, deleteCollab } = 
        useCollabOperations(project.id, onProjectUpdated);
    
    const { 
        editingCollab, 
        formData,
        audioFile, 
        isEditing, 
        isFormVisible, 
        resetForm, 
        handleInputChange,
        handleFileChange, 
        startEdit, 
        startCreate 
    } = useCollabForm();

    useEffect(() => {
        if (project && project.collabs) {
            setCollabs(project.collabs);
        }
    }, [project]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const success = isEditing 
            ? await updateCollab(editingCollab.id, formData, audioFile)
            : await createCollab(formData, audioFile);
            
        if (success) {
            resetForm();
        }
    };

    return (
        <section className="project-management col-span-5 row-span-3">
            <div className="project-management-header">
                <h2 className="project-management-title">Project Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={startCreate}
                    disabled={loading}
                >
                    Add New Collab
                </button>
            </div>

            <ErrorMessage message={error} />

            {isFormVisible && (
                <CollabForm
                    formData={formData}
                    isEditing={isEditing}
                    loading={loading}
                    currentAudioFile={editingCollab?.audioFilePath}
                    onInputChange={handleInputChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleFormSubmit}
                    onCancel={resetForm}
                />
            )}

            <CollabsList
                collabs={collabs}
                loading={loading}
                onEdit={startEdit}
                onRelease={releaseCollab}
                onDelete={deleteCollab}
            />
        </section>
    );
};

export default ProjectManagement; 