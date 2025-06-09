import { useState } from 'react';

const useCollabForm = () => {
    const [editingCollab, setEditingCollab] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        submissionDuration: '',
        votingDuration: ''
    });
    const [audioFile, setAudioFile] = useState(null);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            submissionDuration: '',
            votingDuration: ''
        });
        setAudioFile(null);
        setEditingCollab(null);
        setShowCreateForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setAudioFile(file);
    };

    // Helper function to parse TimeSpan string to days
    const parseTimeSpanToDays = (timeSpanString) => {
        if (!timeSpanString) return '';
        
        try {
            if (typeof timeSpanString === 'number') {
                // If it's already a number, assume it's days
                return timeSpanString.toString();
            }
            
            const str = timeSpanString.toString();
            
            // Handle "7.00:00:00" format (days.hours:minutes:seconds)
            const daysParts = str.split('.');
            if (daysParts.length === 2) {
                const days = parseInt(daysParts[0], 10);
                return isNaN(days) ? '' : days.toString();
            }
            
            // Handle "HH:MM:SS" format (hours:minutes:seconds)
            if (str.includes(':')) {
                const timeParts = str.split(':');
                if (timeParts.length === 3) {
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    const seconds = parseInt(timeParts[2], 10);
                    
                    // Check if this looks like it was meant to be days (small hours with 00:00)
                    if (!isNaN(hours) && minutes === 0 && seconds === 0 && hours > 0 && hours <= 30) {
                        // Small hour values with zero minutes/seconds were likely meant to be days
                        return hours.toString();
                    } else if (!isNaN(hours) && hours >= 24) {
                        // Very large hours value definitely indicates days stored as hours
                        return Math.floor(hours / 24).toString();
                    } else {
                        // Regular hours:minutes:seconds format = 0 days
                        return '0';
                    }
                }
                return '0';
            }
            
            // Try to parse as just a number (days only)
            const days = parseInt(str, 10);
            return isNaN(days) ? '' : days.toString();
            
        } catch (error) {
            console.error('Error parsing TimeSpan:', timeSpanString, error);
            return '';
        }
    };

    const startEdit = (collab) => {
        setEditingCollab(collab);
        setFormData({
            name: collab.name,
            description: collab.description,
            submissionDuration: parseTimeSpanToDays(collab.submissionDuration),
            votingDuration: parseTimeSpanToDays(collab.votingDuration)
        });
        setShowCreateForm(false);
    };

    const startCreate = () => {
        setShowCreateForm(true);
        setEditingCollab(null);
        // Reset form data without affecting visibility
        setFormData({
            name: '',
            description: '',
            submissionDuration: '',
            votingDuration: ''
        });
        setAudioFile(null);
    };

    const isEditing = editingCollab !== null;
    const isFormVisible = showCreateForm || editingCollab;

    return {
        editingCollab,
        showCreateForm,
        formData,
        audioFile,
        isEditing,
        isFormVisible,
        resetForm,
        handleInputChange,
        handleFileChange,
        startEdit,
        startCreate
    };
};

export default useCollabForm; 