namespace MTbackend.Models.DTOs;

public class CollabDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? AudioFilePath { get; set; }
} 