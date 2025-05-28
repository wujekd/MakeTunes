import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioProvider } from '../contexts/AudioContext';
import InfoTop from '../components/InfoTop';
import Favorites from '../components/Favorites';
import Mixer from '../components/Mixer'
import Upload from '../components/Upload';
import SubmissionView from './SubmissionView';
import Submissions from '../components/Submissions';

const VotingView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [votedFor, setVotedFor] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:5242/api/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/projects');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Project data:', data);
        setProject(data);

        // If project is in voting stage, fetch submissions
        if (data.isInVotingStage) {
          const votingCollab = data.collabs.find(c => c.stage === 'Voting');
          if (votingCollab) {
            const submissionsResponse = await fetch(`http://localhost:5242/api/projects/collabs/${votingCollab.id}/submissions`);
            if (submissionsResponse.ok) {
              const submissionsData = await submissionsResponse.json();
              setSubmissions(submissionsData.map(sub => ({
                ...sub,
                listened: false
              })));
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleAddToFavorites = (submission) => {
    if (!favorites.find(fav => fav.id === submission.id)) {
      setFavorites([...favorites, submission]);
      const updatedSubmissions = submissions.filter(sub => sub.id !== submission.id);
      setSubmissions(updatedSubmissions);
    }
  };

  const handleRemoveFromFavorites = (submission) => {
    if (favorites.find(fav => fav.id === submission.id)) {
      const updatedFavorites = favorites.filter(sub => sub.id !== submission.id);
      setFavorites(updatedFavorites);
      
      if (!submissions.find(sub => sub.id === submission.id)) {
        setSubmissions([...submissions, submission]);
      }

      if (votedFor === submission.id) {
        setVotedFor(null);
      }
    }
  };

  const handleVote = async (submission) => {
    if (isSubmittingVote) return;
    
    setIsSubmittingVote(true);
    try {
      const votingCollab = project.collabs.find(c => c.stage === 'Voting');
      const response = await fetch(`http://localhost:5242/api/projects/collabs/${votingCollab.id}/submissions/${submission.id}/vote`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setVotedFor(submission.id);
        const updatedFavorites = [
          submission,
          ...favorites.filter(fav => fav.id !== submission.id)
        ];
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleMarkAsListened = async (submissionId) => {
    setSubmissions(prevSubmissions => 
      prevSubmissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, listened: true }
          : sub
      )
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return null;

  // Check if the project is in voting stage
  if (project.isInVotingStage) {
    console.log('Project is in voting stage, showing voting interface');
    const votingCollab = project.collabs.find(c => c.stage === 'Voting');
    return (
      <AudioProvider>
        <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
          <InfoTop project={project} collab={votingCollab} />
          <Favorites 
            favorites={favorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onVote={handleVote}
            votedFor={votedFor}
            isSubmittingVote={isSubmittingVote}
          />
          <Mixer submissions={[...submissions, ...favorites]} />
          <Submissions 
            onAddToFavorites={handleAddToFavorites}
            mockSubmissions={submissions}
            onMarkAsListened={handleMarkAsListened}
          />
        </main>
      </AudioProvider>
    );
  }

  // Show SubmissionView for projects not in voting stage
  console.log('Project is not in voting stage, showing submission view');
  return <SubmissionView project={project} />;
};

export default VotingView; 