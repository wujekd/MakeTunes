namespace MTbackend.Models;
using System.ComponentModel.DataAnnotations;


public class Project
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
}