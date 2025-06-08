import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioProvider, useAudio } from '../contexts/AudioContext';
import InfoTop from '../components/InfoTop';
import Favorites from '../components/Favorites';
import Mixer from '../components/Mixer'
import SubmissionView from './SubmissionView';
import Submissions from '../components/Submissions';
import { api } from '../services/api';

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
        const response = await fetch(`http://localhost:5242/api/ProjectControllers/${projectId}`);
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
              const submissionsResponse = await fetch(`http://localhost:5242/api/ProjectControllers/collabs/${votingCollab.id}/submissions`);
              if (submissionsResponse.ok) {
                const submissionsData = await submissionsResponse.json();
                console.log('Raw submissions data:', submissionsData);
                const processedSubmissions = submissionsData.map(sub => ({
                  ...sub,
                  markingListened: false,
                  audioUrl: sub.audioFilePath ? `/uploads/${sub.audioFilePath.split('/').pop()}` : null
                }));
                console.log('Processed submissions with audio URLs:', processedSubmissions);

                //processedSubmissions.filter(sub => !favorites.some(fav => fav.id === sub.id))   ??? 

                setSubmissions(processedSubmissions.filter(sub => sub.favorited == false))
                setFavorites(processedSubmissions.filter(sub => sub.favorited == true))
                setVotedFor(processedSubmissions.find(sub => sub.final === true)?.id);

                console.log("test getting final id: ", processedSubmissions.find(sub => sub.final === true)?.id);
                
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


  useEffect(() => {
    console.log('voting for:', votedFor);
  }, [votedFor]);



// ADD TO FAVORITES
  const handleAddToFavorites = useCallback (async (submission) => {

    try {
      const result = await api.addFavorite(submission.id, submission.collabId);
      console.log('result: ', result);

      setFavorites(prev => [...prev, submission]);
      setSubmissions(prev => prev.filter(sub => sub.id !== submission.id));

      console.log('favorites: ', favorites);
      console.log('submissions: ', submissions);
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }

  }, [favorites]);


  //REMOVE FROM FAVORITES
  const handleRemoveFromFavorites = useCallback(async (submission) => {
    try {
      // Check first if it’s currently in favorites
      if (!favorites.find(fav => fav.id === submission.id)) return;
  
      console.log('Removing from favorites:', submission);
  
      const response = await api.removeFavorite(submission.id, submission.collabId);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Update frontend state only after successful API response
      setFavorites(prev => prev.filter(sub => sub.id !== submission.id));
  
      setSubmissions(prev => {
        if (!prev.find(sub => sub.id === submission.id)) {
          return [...prev, submission];
        }
        return prev;
      });
  
      if (votedFor?.id === submission.id) {
        setVotedFor(null);
      }
  
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Optional: show user feedback here
    }
  }, [favorites, submissions, votedFor]);
  

// SELECT VOTE
  const handleVote = useCallback(async (submission) => {
    if (isSubmittingVote) return;
    
    setIsSubmittingVote(true);
    try {
      
      await api.markFinalChoice(submission.id);

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



  

// MARK AS LISTENED
const handleMarkAsListened = useCallback(async (submissionId) => {
  // Mark as in progress
  setSubmissions(prev =>
    prev.map(sub =>
      sub.id === submissionId
        ? { ...sub, markingListened: true }
        : sub
    )
  );
  try {
    await api.markSubmissionAsListened(submissionId);
  
    // On success: mark as listened and clear loading state
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId
          ? { ...sub, listened: true, markingListened: false }
          : sub
      )
    );
  } catch (err) {
    console.error("Failed to mark as listened:", err);

    // reset state if failed
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === submissionId
          ? { ...sub, markingListened: false }
          : sub
      )
    );
  }
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