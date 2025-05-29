namespace MTbackend.Models.DTOs;

public class CreateFavoriteDto
{
    public int SubmissionId { get; set; }
    public int CollabId { get; set; }
}

public class FavoriteResponseDto
{
    public int Id { get; set; }
    public int SubmissionId { get; set; }
    public int CollabId { get; set; }
    public bool IsFinalChoice { get; set; }
    public DateTime CreatedAt { get; set; }
} 