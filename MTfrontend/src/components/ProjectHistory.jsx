import React from 'react';
import './ProjectHistory.css';

const ProjectHistory = ({ 
  project, 
  activeCollab, 
  selectedCollab, 
  onSelectCollab 
}) => {
  if (!project || !project.collabs || project.collabs.length === 0) {
    return null;
  }

  const handleCollabClick = (collab) => {
    // If clicking the active collab, select it (this will show submissions)
    // If clicking an inactive collab, select it (this will show collab info)
    onSelectCollab(collab);
  };

  return (
    <div className="project-history">
      <h4 className="project-history-title">Collab History</h4>
      <div className="collab-list">
        {project.collabs.map((collab, index) => {
          // A collab is active if it's the latest AND not completed
          const isActive = activeCollab && collab.id === activeCollab.id && !collab.completed;
          const isSelected = selectedCollab && collab.id === selectedCollab.id;
          
          return (
            <div 
              key={collab.id}
              className={`collab-history-item ${isActive ? 'active' : 'inactive'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCollabClick(collab)}
            >
              <div className="collab-status-indicator">
                {isActive ? '●' : '○'}
              </div>
              <div className="collab-info">
                <span className="collab-name">{collab.name}</span>
                <span className="collab-stage">{collab.completed ? 'Completed' : collab.stage}</span>
              </div>
              {isActive && (
                <span className="active-badge">Active</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectHistory; 