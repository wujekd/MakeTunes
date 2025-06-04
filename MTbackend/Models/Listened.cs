namespace MTbackend.Models;

public class Listened
{
    public int Id { get; set; }
    public Submission Submission { get; set; }
    public Project Project { get; set; } 
    // TODO: change to collab or remove???
}