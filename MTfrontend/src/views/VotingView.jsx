import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioProvider, useAudio } from '../contexts/AudioContext';
import InfoTop from '../components/InfoTop';
import Favorites from '../components/Favorites';
import Mixer from '../components/Mixer'
import Upload from '../components/Upload';
import SubmissionView from './SubmissionView';
import Submissions from '../components/Submissions';

const AudioInitializer = ({ children, backingTrackUrl }) => {
  const { setBackingTrack } = useAudio();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (backingTrackUrl && !initialized) {
      console.log('Initializing backing track with URL:', backingTrackUrl);
      setBackingTrack(backingTrackUrl);
      setInitialized(true);
    }
  }, [backingTrackUrl, setBackingTrack, initialized]);

  return children;
};

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
    let isMounted = true;

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
        if (isMounted) {
          console.log('Project data:', data);
          setProject(data);

          if (data.isInVotingStage) {
            const votingCollab = data.collabs[data.collabs.length - 1];
            if (votingCollab) {
              const submissionsResponse = await fetch(`http://localhost:5242/api/projects/collabs/${votingCollab.id}/submissions`);
              if (submissionsResponse.ok) {
                const submissionsData = await submissionsResponse.json();
                console.log('Raw submissions data:', submissionsData);
                const processedSubmissions = submissionsData.map(sub => ({
                  ...sub,
                  listened: false,
                  audioUrl: sub.audioFilePath ? `/uploads/${sub.audioFilePath.split('/').pop()}` : null
                }));
                console.log('Processed submissions with audio URLs:', processedSubmissions);
                setSubmissions(processedSubmissions);
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [projectId, navigate]);

  const handleAddToFavorites = useCallback((submission) => {
    if (!favorites.find(fav => fav.id === submission.id)) {
      console.log('Adding to favorites:', submission);
      setFavorites(prev => [...prev, submission]);
      setSubmissions(prev => prev.filter(sub => sub.id !== submission.id));
    }
  }, [favorites]);

  const handleRemoveFromFavorites = useCallback((submission) => {
    if (favorites.find(fav => fav.id === submission.id)) {
      console.log('Removing from favorites:', submission);
      setFavorites(prev => prev.filter(sub => sub.id !== submission.id));
      if (!submissions.find(sub => sub.id === submission.id)) {
        setSubmissions(prev => [...prev, submission]);
      }
      if (votedFor === submission.id) {
        setVotedFor(null);
      }
    }
  }, [favorites, submissions, votedFor]);

  const handleVote = useCallback(async (submission) => {
    if (isSubmittingVote) return;
    
    setIsSubmittingVote(true);
    try {
      // Simulate API call with a 1-second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful vote
      setVotedFor(submission.id);
      setFavorites(prev => [
        submission,
        ...prev.filter(fav => fav.id !== submission.id)
      ]);
      
      console.log('Vote submitted for submission:', submission.id);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmittingVote(false);
    }
  }, [isSubmittingVote]);

  const handleMarkAsListened = useCallback((submissionId) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, listened: true }
          : sub
      )
    );
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return null;

  if (project.isInVotingStage) {
    const votingCollab = project.collabs[project.collabs.length - 1];
    
    if (!votingCollab) {
      return <div>No voting collaboration found</div>;
    }

    const backingTrackUrl = votingCollab.audioFilePath 
      ? `http://localhost:5242${votingCollab.audioFilePath}`
      : null;

    return (
      <AudioProvider>
        <AudioInitializer backingTrackUrl={backingTrackUrl}>
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
        </AudioInitializer>
      </AudioProvider>
    );
  }

  return <SubmissionView project={project} />;
};

export default VotingView; 