import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreateProjectForm } from './CreateProjectForm';
import './Projects.css';

const UserProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();
    const { token } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5242/api/ProjectControllers', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError(`Failed to fetch projects: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [token]);

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    if (loading) return <div className="projects-loading">Loading projects...</div>;
    if (error) return <div className="projects-error">Error: {error}</div>;

    return (
        <section className="projects-section">
            <div className="flex justify-between items-center mb-6">
                <h2 className="projects-title">Your Projects</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Create Project
                </button>
            </div>
            
            <div className="projects-grid">
                {projects.length === 0 ? (
                    <div className="projects-empty">No projects found</div>
                ) : (
                    projects.map(project => (
                        <div 
                            key={project.id} 
                            className="project-card"
                            onClick={() => handleProjectClick(project.id)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleProjectClick(project.id);
                                }
                            }}
                        >
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-description">{project.description}</p>
                            {project.audioFilePath && (
                                <audio 
                                    controls 
                                    className="project-audio"
                                    src={`http://localhost:5242${project.audioFilePath}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showCreateModal && (
                <CreateProjectForm onClose={() => setShowCreateModal(false)} />
            )}
        </section>
    );
};

export default UserProjects; 