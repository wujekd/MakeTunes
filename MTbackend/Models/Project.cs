namespace MTbackend.Models;
using System.ComponentModel.DataAnnotations;


public class Project
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? AudioFilePath { get; set; }
}