namespace MTbackend.Models;

public class Submission
{
    public required int Id { get; set; }
    public required string AudioFilePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 