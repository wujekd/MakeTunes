using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Services;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]          // => /api/projects
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly CollabService _collabService;

    public ProjectsController(AppDbContext context, IWebHostEnvironment environment, CollabService collabService)
    {
        _context = context;
        _environment = environment;
        _collabService = collabService;
    }

    [HttpGet]                        // GET /api/projects
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        return await _context.Projects
            .Include(p => p.Collabs)
            .ToListAsync();
    }

    [HttpGet("{id}")]               // GET /api/projects/{id}
    public async Task<ActionResult<Project>> GetProject(string id)
    {
        var project = await _context.Projects
            .Include(p => p.Collabs)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        return project;
    }

    [HttpPost]
    public async Task<ActionResult<Project>> AddProject(ProjectDto projectDto)
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

    [HttpPost("{projectId}/collabs")]
    public async Task<ActionResult<Collab>> AddCollab(string projectId, [FromForm] CollabDto collabDto)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
        {
            return NotFound();
        }

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

        var collab = await _collabService.CreateCollab(
            name: collabDto.Name,
            description: collabDto.Description,
            projectId: projectId,
            audioFilePath: audioFilePath
        );

        return Ok(collab);
    }

    [HttpGet("collabs/{collabId}/submissions")]
    public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissions(int collabId)
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

    [HttpPost("collabs/{collabId}/submissions")]
    public async Task<ActionResult<Submission>> AddSubmission(int collabId, IFormFile audioFile, float volumeOffset = 1.0f)
    {
        var collab = await _context.Collabs.FindAsync(collabId);
        if (collab == null)
        {
            return NotFound("Collab not found");
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

    private async Task<int> GetNextSubmissionId()
    {
        var lastSubmission = await _context.Submissions.OrderByDescending(s => s.Id).FirstOrDefaultAsync();
        return (lastSubmission?.Id ?? 0) + 1;
    }
}

public class ProjectDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
}

public class CollabDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public IFormFile? AudioFile { get; set; }
}