using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Services;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectControllers : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly CollabService _collabService;

    public ProjectControllers(AppDbContext context, IWebHostEnvironment environment, CollabService collabService)
    {
        _context = context;
        _environment = environment;
        _collabService = collabService;
    }

    /// <summary>
    /// Gets all projects
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _context.Projects
            .Include(p => p.Collabs.Where(c => c.Released)) // Only include released collabs in general view
            .ToListAsync();
        
        return Ok(projects);
    }

    /// <summary>
    /// Gets a specific project with all collabs (including unreleased for management)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(string id)
    {
        var project = await _context.Projects
            .Include(p => p.Collabs) // Include all collabs for management view
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }

    /// <summary>
    /// Creates a new project
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> AddProject(ProjectDto projectDto)
    {
        var project = new Project
        {
            Id = Guid.NewGuid().ToString(),
            Name = projectDto.Name,
            Description = projectDto.Description
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Create initial collab
        await _collabService.CreateInitialCollab(project.Id);

        return Ok(project);
    }

    /// <summary>
    /// Creates a new collab for a project
    /// </summary>
    [HttpPost("{projectId}/collabs")]
    public async Task<IActionResult> CreateCollab(string projectId, [FromForm] CreateCollabFormDto collabDto)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
        {
            return NotFound("Project not found");
        }

        // Handle audio file upload
        string? audioFilePath = null;
        if (collabDto.AudioFile != null)
        {
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{collabDto.AudioFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await collabDto.AudioFile.CopyToAsync(stream);
            }

            audioFilePath = $"/uploads/{uniqueFileName}";
        }

        var collab = new Collab
        {
            Id = await GetNextCollabId(),
            Name = collabDto.Name,
            Description = collabDto.Description,
            ProjectId = projectId,
            Project = project,
            AudioFilePath = audioFilePath,
            Released = false, // Always start as unreleased
            SubmissionDuration = collabDto.SubmissionDuration != null ? TimeSpan.Parse(collabDto.SubmissionDuration) : null,
            VotingDuration = collabDto.VotingDuration != null ? TimeSpan.Parse(collabDto.VotingDuration) : null,
            Completed = false,
            Stage = CollabStage.Submission
        };

        _context.Collabs.Add(collab);
        await _context.SaveChangesAsync();

        return Ok(collab);
    }

    /// <summary>
    /// Updates an existing collab (only if not released) - JSON version (no file)
    /// </summary>
    [HttpPut("collabs/{id}")]
    public async Task<IActionResult> UpdateCollab(int id, [FromBody] UpdateCollabDto collabDto)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Released)
        {
            return BadRequest("Cannot edit a released collab");
        }

        collab.Name = collabDto.Name;
        collab.Description = collabDto.Description;
        collab.SubmissionDuration = collabDto.SubmissionDuration != null ? TimeSpan.Parse(collabDto.SubmissionDuration) : null;
        collab.VotingDuration = collabDto.VotingDuration != null ? TimeSpan.Parse(collabDto.VotingDuration) : null;

        await _context.SaveChangesAsync();

        return Ok(collab);
    }

    /// <summary>
    /// Updates an existing collab with file replacement (only if not released)
    /// </summary>
    [HttpPut("collabs/{id}/with-file")]
    public async Task<IActionResult> UpdateCollabWithFile(int id, [FromForm] UpdateCollabFormDto collabDto)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Released)
        {
            return BadRequest("Cannot edit a released collab");
        }

        // Handle audio file replacement
        if (collabDto.AudioFile != null)
        {
            // Delete old file if it exists
            if (!string.IsNullOrEmpty(collab.AudioFilePath))
            {
                var oldFilePath = Path.Combine(_environment.WebRootPath, collab.AudioFilePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            // Save new file
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{collabDto.AudioFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await collabDto.AudioFile.CopyToAsync(stream);
            }

            collab.AudioFilePath = $"/uploads/{uniqueFileName}";
        }

        collab.Name = collabDto.Name;
        collab.Description = collabDto.Description;
        collab.SubmissionDuration = collabDto.SubmissionDuration != null ? TimeSpan.Parse(collabDto.SubmissionDuration) : null;
        collab.VotingDuration = collabDto.VotingDuration != null ? TimeSpan.Parse(collabDto.VotingDuration) : null;

        await _context.SaveChangesAsync();

        return Ok(collab);
    }

    /// <summary>
    /// Releases a collab (one-way action)
    /// </summary>
    [HttpPut("collabs/{id}/release")]
    public async Task<IActionResult> ReleaseCollab(int id)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Released)
        {
            return BadRequest("Collab is already released");
        }

        collab.Released = true;
        collab.ReleaseTime = DateTime.UtcNow; // Set the release timestamp
        
        // Set project voting stage if this collab is in voting mode
        if (collab.Stage == CollabStage.Voting)
        {
            collab.Project.IsInVotingStage = true;
        }

        await _context.SaveChangesAsync();

        return Ok(collab);
    }

    /// <summary>
    /// Deletes a collab
    /// </summary>
    [HttpDelete("collabs/{id}")]
    public async Task<IActionResult> DeleteCollab(int id)
    {
        var collab = await _context.Collabs
            .Include(c => c.Submissions)
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        // Delete associated submissions and their files
        foreach (var submission in collab.Submissions)
        {
            if (!string.IsNullOrEmpty(submission.AudioFilePath))
            {
                var filePath = Path.Combine(_environment.WebRootPath, submission.AudioFilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        // Delete collab audio file if exists
        if (!string.IsNullOrEmpty(collab.AudioFilePath))
        {
            var filePath = Path.Combine(_environment.WebRootPath, collab.AudioFilePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.Collabs.Remove(collab);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Collab deleted successfully" });
    }

    /// <summary>
    /// Gets submissions for a collab
    /// </summary>
    [HttpGet("collabs/{collabId}/submissions")]
    public async Task<IActionResult> GetSubmissions(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Project == null)
        {
            return BadRequest("Collab has no associated project");
        }

        // Get all listened submissions for this project
        var listenedSubmissions = await _context.ListenedMarkings
            .Where(l => l.Project.Id == collab.Project.Id)
            .Select(l => l.Submission.Id)
            .ToListAsync();

        // Get all favorited submissions for this collab
        var favoritedObjects = await _context.Favorites
            .Where(f => f.CollabId == collabId).Include(favorite => favorite.Submission)
            .ToListAsync();
        var favoritedSubmissionsIds = favoritedObjects.Select(f => f.Submission.Id).ToList();
        
        var finalVote = favoritedObjects.FirstOrDefault(sub => sub.IsFinalChoice == true);

        var submissions = await _context.Submissions
            .Where(s => s.CollabId == collabId)
            .Select(s => new {
                s.Id,
                s.AudioFilePath,
                s.CollabId,
                s.CreatedAt,
                s.Status,
                s.VolumeOffset,
                listened = listenedSubmissions.Contains(s.Id),
                favorited = favoritedSubmissionsIds.Contains(s.Id),
                final = finalVote != null && finalVote.Submission.Id == s.Id
            })
            .ToListAsync();

        return Ok(submissions);
    }

    /// <summary>
    /// Adds a submission to a collab
    /// </summary>
    [HttpPost("collabs/{collabId}/submissions")]
    public async Task<IActionResult> AddSubmission(int collabId, IFormFile audioFile, float volumeOffset = 1.0f)
    {
        var collab = await _context.Collabs.FindAsync(collabId);
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (!collab.Released)
        {
            return BadRequest("Cannot add submissions to an unreleased collab");
        }

        if (audioFile == null)
        {
            return BadRequest("Audio file is required");
        }

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{audioFile.FileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await audioFile.CopyToAsync(stream);
        }

        var submission = new Submission
        {
            Id = await GetNextSubmissionId(),
            AudioFilePath = $"/uploads/{uniqueFileName}",
            CollabId = collabId,
            Collab = collab,
            VolumeOffset = volumeOffset
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return Ok(submission);
    }

    private async Task<int> GetNextCollabId()
    {
        var lastCollab = await _context.Collabs.OrderByDescending(c => c.Id).FirstOrDefaultAsync();
        return (lastCollab?.Id ?? 0) + 1;
    }

    private async Task<int> GetNextSubmissionId()
    {
        var lastSubmission = await _context.Submissions.OrderByDescending(s => s.Id).FirstOrDefaultAsync();
        return (lastSubmission?.Id ?? 0) + 1;
    }
}

// DTOs for Collab Management
public class CreateCollabDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? SubmissionDuration { get; set; } // Format: "7:00:00" for 7 days
    public string? VotingDuration { get; set; }     // Format: "3:00:00" for 3 days
}

public class CreateCollabFormDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? SubmissionDuration { get; set; } // Format: "7:00:00" for 7 days
    public string? VotingDuration { get; set; }     // Format: "3:00:00" for 3 days
    public IFormFile? AudioFile { get; set; }
}

public class UpdateCollabDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? SubmissionDuration { get; set; } // Format: "7:00:00" for 7 days
    public string? VotingDuration { get; set; }     // Format: "3:00:00" for 3 days
}

public class UpdateCollabFormDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? SubmissionDuration { get; set; } // Format: "7:00:00" for 7 days
    public string? VotingDuration { get; set; }     // Format: "3:00:00" for 3 days
    public IFormFile? AudioFile { get; set; }
} 