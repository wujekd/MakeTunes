using System.ComponentModel.DataAnnotations;

namespace MTbackend.Models;

public class Submission
{
    public string UserId { get; set; }
    public User User { get; set; }
    
    [Key]
    public required int Id { get; set; }
    public required string AudioFilePath { get; set; }
    public required int CollabId { get; set; }
    public required Collab Collab { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
    public float VolumeOffset { get; set; } = 1.0f;
}

public enum SubmissionStatus
{
    Pending,
    Approved,
    Rejected
} 