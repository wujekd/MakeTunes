using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MTbackend.Models;

public class Favorite
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int SubmissionId { get; set; }
    
    [ForeignKey("SubmissionId")]
    public Submission Submission { get; set; }
    
    [Required]
    public int CollabId { get; set; }
    
    [ForeignKey("CollabId")]
    public Collab Collab { get; set; }
    
    public bool IsFinalChoice { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
} 