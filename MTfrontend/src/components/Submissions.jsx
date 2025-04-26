import React from 'react';
import SubmissionItem from './SubmissionItem';

const Submissions = ({ onAddToFavorites, mockSubmissions }) => {
  

  return (
    <section className="submissions-section col-span-5 row-span-3">
      <h2 className="submissions-title">Submissions</h2>
      
      <div className="submissions-container">
        {mockSubmissions.map(submission => (
          <SubmissionItem 
            key={submission.id}
            submission={submission}
            onAddToFavorites={onAddToFavorites}
          />
        ))}
      </div>
    </section>
  );
};

export default Submissions; 