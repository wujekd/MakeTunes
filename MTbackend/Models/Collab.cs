using System.ComponentModel.DataAnnotations.Schema;

namespace MTbackend.Models;

public enum CollabStage
{
    Submission,
    Voting,
    Completed
}

public class Collab
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? AudioFilePath { get; set; }
    public required string ProjectId { get; set; }
    public required Project Project { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public CollabStage Stage { get; set; } = CollabStage.Submission;
    public bool Released { get; set; } = false;
    public DateTime? ReleaseTime { get; set; }
    public TimeSpan? SubmissionDuration { get; set; }
    public TimeSpan? VotingDuration { get; set; }
    public bool Completed { get; set; } = false;
    public string? CompletionReason { get; set; }
    public int? WinningSubmissionId { get; set; }
    
    [ForeignKey("WinningSubmissionId")]
    public Submission? WinningSubmission { get; set; }
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    
    // Calculated properties for easy access
    public DateTime? SubmissionEndTime => ReleaseTime?.Add(SubmissionDuration ?? TimeSpan.Zero);
    public DateTime? VotingEndTime => SubmissionEndTime?.Add(VotingDuration ?? TimeSpan.Zero);
} 