/**
 * Get the latest collab from a project
 * @param {Object} project - The project object
 * @returns {Object|null} - The latest collab or null if none exist
 */
export const getLatestCollab = (project) => {
    if (!project?.collabs || project.collabs.length === 0) {
        return null;
    }
    return project.collabs[project.collabs.length - 1];
};

/**
 * Get released collabs from a project
 * @param {Object} project - The project object
 * @returns {Array} - Array of released collabs
 */
export const getReleasedCollabs = (project) => {
    if (!project?.collabs) {
        return [];
    }
    return project.collabs.filter(collab => collab.released);
};

/**
 * Get draft collabs from a project
 * @param {Object} project - The project object
 * @returns {Array} - Array of draft collabs
 */
export const getDraftCollabs = (project) => {
    if (!project?.collabs) {
        return [];
    }
    return project.collabs.filter(collab => !collab.released);
};

/**
 * Format duration to readable string
 * @param {number|string} duration - Duration in seconds (legacy) or TimeSpan string (current)
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (duration) => {
    if (!duration) return 'Not set';
    
    let days;
    
    if (typeof duration === 'string') {
        try {
            const str = duration.toString();
            
            // Handle "7.00:00:00" format (days.hours:minutes:seconds)
            const daysParts = str.split('.');
            if (daysParts.length === 2) {
                days = parseInt(daysParts[0], 10);
            } else if (str.includes(':')) {
                // Handle "HH:MM:SS" format (hours:minutes:seconds)
                const timeParts = str.split(':');
                if (timeParts.length === 3) {
                    const hours = parseInt(timeParts[0], 10);
                    const minutes = parseInt(timeParts[1], 10);
                    const seconds = parseInt(timeParts[2], 10);
                    
                    // Check if this looks like it was meant to be days (small hours with 00:00)
                    if (!isNaN(hours) && minutes === 0 && seconds === 0 && hours > 0 && hours <= 30) {
                        // Small hour values with zero minutes/seconds were likely meant to be days
                        // (e.g., "02:00:00" was probably meant to be 2 days, not 2 hours)
                        days = hours;
                    } else if (!isNaN(hours) && hours >= 24) {
                        // Very large hours value definitely indicates days stored as hours
                        days = Math.floor(hours / 24);
                    } else {
                        // Regular hours:minutes:seconds format = 0 days
                        days = 0;
                    }
                } else {
                    days = 0;
                }
            } else {
                // Try to parse as just a number (days only)
                days = parseInt(str, 10);
            }
        } catch (error) {
            console.error('Error parsing TimeSpan duration:', duration, error);
            return 'Invalid duration';
        }
    } else if (typeof duration === 'number') {
        // Legacy format: duration in seconds
        days = Math.floor(duration / 86400);
    } else {
        return 'Invalid duration';
    }
    
    if (isNaN(days)) {
        return 'Invalid duration';
    }
    
    return `${days} day${days !== 1 ? 's' : ''}`;
}; 