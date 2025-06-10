import React from 'react';
import './InfoTop.css';
import Display from './Display';
import ProjectHistory from './ProjectHistory';

const InfoTop = ({ 
  project, 
  collab, 
  selectedCollab, 
  onSelectCollab 
}) => {

  // if loading
  if (!project) {
    return (
      <section className='info-section col-span-7 row-span-2'>
        <div className='w-2/3 flex flex-col gap-3'>
          <h3>Loading...</h3>
        </div>
      </section>
    );
  }

  //else
  return (
    <section className='info-section col-span-7 row-span-2'>
      <div className='w-2/3 flex flex-col gap-3'>
        <h3>{project.name}</h3>
        {collab ? (
          <>
            <p>Collab: {collab.name}</p>
            <p className="text-gray-500 text-xl">{collab.description}</p>
          </>
        ) : (
          <p className="text-gray-500 text-xl">{project.description}</p>
        )}
      </div>
      
      <ProjectHistory 
        project={project}
        activeCollab={collab}
        selectedCollab={selectedCollab}
        onSelectCollab={onSelectCollab}
      />
    </section>
  );
};

export default InfoTop;