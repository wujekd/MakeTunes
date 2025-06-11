namespace MTbackend.Models;
using System.ComponentModel.DataAnnotations;


public class Project
{
    public string UserId { get; set; }
    public User User { get; set; }
    public required string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ICollection<Collab> Collabs { get; set; } = new List<Collab>();
    public string? AudioFilePath { get; set; }
    public bool IsInVotingStage { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}