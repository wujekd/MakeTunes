using Microsoft.AspNetCore.Http;

namespace MTbackend.Models.DTOs;

public class SubmissionDto
{
    public IFormFile File { get; set; }
    public int CollabId { get; set; }
    public float VolumeOffset { get; set; } = 1.0f;
} 