import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5242/api/ProjectControllers');
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
    }, []);

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}`);
    };

    if (loading) return (
        <main className="projects-page">
            <header className="projects-page-header">
                <h1 className="projects-page-title">Projects</h1>
            </header>
            <div className="projects-loading">Loading projects...</div>
        </main>
    );
    
    if (error) return (
        <main className="projects-page">
            <header className="projects-page-header">
                <h1 className="projects-page-title">Projects</h1>
            </header>
            <div className="projects-error">Error: {error}</div>
        </main>
    );

    return (
        <main className="projects-page">
            <header className="projects-page-header">
                <h1 className="projects-page-title">All Projects</h1>
            </header>
            
            <div className="projects-page-content">
                <section className="projects-section">
                    <div className="projects-grid">
                        {projects.length === 0 ? (
                            <div className="projects-empty">No projects found</div>
                        ) : (
                            projects.map(project => (
                                <div 
                                    key={project.id} 
                                    className="project-card"
                                >
                                    <div 
                                        className="project-card-content"
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
                                        {project.isInVotingStage && (
                                            <div className="project-status">Voting Stage</div>
                                        )}
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
                                    <div className="project-actions">
                                        <button
                                            className="btn btn-manage"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/projects/${project.id}/manage`);
                                            }}
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Projects;