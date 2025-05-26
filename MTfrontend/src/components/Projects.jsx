import React, { useState, useEffect } from 'react';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5242/api/projects');
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

    if (loading) return <div className="projects-loading">Loading projects...</div>;
    if (error) return <div className="projects-error">Error: {error}</div>;

    return (
        <section className="projects-section">
            <h2 className="projects-title">Projects</h2>
            <div className="projects-grid">
                {projects.length === 0 ? (
                    <div className="projects-empty">No projects found</div>
                ) : (
                    projects.map(project => (
                        <div key={project.id} className="project-card">
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-description">{project.description}</p>
                            {project.audioFilePath && (
                                <audio 
                                    controls 
                                    className="project-audio"
                                    src={`http://localhost:5000${project.audioFilePath}`}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default Projects;