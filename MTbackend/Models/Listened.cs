using System.ComponentModel.DataAnnotations;

namespace MTbackend.Models;

public class Listened
{
    public string UserId { get; set; }
    public User User { get; set; }
    
    [Key]
    public int Id { get; set; }
    public Submission Submission { get; set; }
    public Project Project { get; set; } 
    // TODO: change to collab or remove???
}