namespace MTbackend.Models;
using Microsoft.AspNetCore.Http;

public class ProjectDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public IFormFile? AudioFile { get; set; }
} 