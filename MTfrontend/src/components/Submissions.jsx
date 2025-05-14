import React from 'react';
import SubmissionItem from './SubmissionItem';
import './Submissions.css';

const Submissions = ({ onAddToFavorites, mockSubmissions, onMarkAsListened }) => {
  

  return (
    <section className="submissions-section col-span-5 row-span-3">
      <h2 className="submissions-title">Submissions</h2>
      
      <div className="submissions-container">
        {mockSubmissions.map(submission => (
          <SubmissionItem 
            key={submission.id}
            submission={submission}
            onAddToFavorites={onAddToFavorites}
            onMarkAsListened={onMarkAsListened}
          />
        ))}
      </div>
    </section>
  );
};

export default Submissions; 