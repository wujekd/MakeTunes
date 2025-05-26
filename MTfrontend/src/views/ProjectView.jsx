import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AudioProvider } from '../contexts/AudioContext';
import InfoTop from '../components/InfoTop';
import Favorites from '../components/Favorites';
import Mixer from '../components/Mixer'
import Upload from '../components/Upload';
import SubmissionView from './SubmissionView';

const ProjectView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return null;

  // Check if the project has any collabs in voting stage
  const hasVotingCollab = project.collabs?.some(collab => collab.stage === 'Voting');

  if (hasVotingCollab) {
    return (
      <AudioProvider>
        <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
          <InfoTop project={project} />
          <Favorites />
          <Mixer />
        </main>
      </AudioProvider>
    );
  }

  // Always show SubmissionView for projects without voting collabs
  return <SubmissionView project={project} />;
};

export default ProjectView; 