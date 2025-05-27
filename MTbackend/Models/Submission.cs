using System.ComponentModel.DataAnnotations;

namespace MTbackend.Models;

public class Submission
{
    public required int Id { get; set; }
    public required string AudioFilePath { get; set; }
    public required int CollabId { get; set; }
    public required Collab Collab { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Pending;
}

public enum SubmissionStatus
{
    Pending,
    Approved,
    Rejected
} 