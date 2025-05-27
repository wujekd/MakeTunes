using Microsoft.AspNetCore.Mvc;
using MTbackend.Models;
using MTbackend.Data;
using Microsoft.EntityFrameworkCore;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SubmissionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/submissions/collab/{collabId}
    [HttpGet("collab/{collabId}")]
    public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissionsForCollab(int collabId)
    {
        var submissions = await _context.Submissions
            .Where(s => s.CollabId == collabId)
            .ToListAsync();

        return Ok(submissions);
    }

    // POST: api/submissions
    [HttpPost]
    public async Task<ActionResult<Submission>> CreateSubmission([FromForm] IFormFile file, [FromForm] int collabId, [FromForm] float volumeOffset = 1.0f)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Check if collab exists
        var collab = await _context.Collabs.FindAsync(collabId);
        if (collab == null)
        {
            return NotFound("Collaboration not found");
        }

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine("uploads", fileName);

        // Ensure uploads directory exists
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        // Save file
        using (var stream = new FileStream(Path.Combine(uploadsDir, fileName), FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Create submission record
        var submission = new Submission
        {
            CollabId = collabId,
            AudioFilePath = "/uploads/" + fileName,
            CreatedAt = DateTime.UtcNow,
            VolumeOffset = volumeOffset
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubmissionsForCollab), new { collabId = collabId }, submission);
    }
} 