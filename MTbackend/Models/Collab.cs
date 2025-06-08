namespace MTbackend.Models;

public enum CollabStage
{
    Submission,
    Voting
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
    public TimeSpan? SubmissionDuration { get; set; }
    public TimeSpan? VotingDuration { get; set; }
    public bool Completed { get; set; } = false;
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
} 