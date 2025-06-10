using Microsoft.AspNetCore.Identity;

namespace MTbackend.Models;

public class User : IdentityUser
{
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Listened> ListenedTo { get; set; } = new List<Listened>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}