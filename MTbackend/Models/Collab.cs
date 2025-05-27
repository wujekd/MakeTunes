namespace MTbackend.Models;

public class Collab
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? AudioFilePath { get; set; }
    public required string ProjectId { get; set; }
    public required Project Project { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
} 