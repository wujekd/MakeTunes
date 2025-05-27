using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Services;

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
        var collab = await _context.Collabs.FindAsync(collabId);
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        var submissions = await _context.Submissions
            .Where(s => s.CollabId == collabId)
            .ToListAsync();

        return Ok(submissions);
    }

    [HttpPost("collabs/{collabId}/submissions")]
    public async Task<ActionResult<Submission>> AddSubmission(int collabId, IFormFile audioFile)
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
            Collab = collab
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

[ApiController]
[Route("api/[controller]")]
public class SubmissionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SubmissionsController> _logger;

    public SubmissionsController(AppDbContext context, ILogger<SubmissionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/submissions/collab/{collabId}
    [HttpGet("collab/{collabId}")]
    public async Task<ActionResult<IEnumerable<Submission>>> GetSubmissionsForCollab(int collabId)
    {
        _logger.LogInformation($"Getting submissions for collab {collabId}");
        var submissions = await _context.Submissions
            .Where(s => s.CollabId == collabId)
            .ToListAsync();

        return Ok(submissions);
    }

    // POST: api/submissions
    [HttpPost]
    public async Task<ActionResult<Submission>> CreateSubmission([FromForm] int collabId, [FromForm] float volumeOffset = 1.0f)
    {
        _logger.LogInformation($"Received submission request for collab {collabId} with volume offset {volumeOffset}");

        // Check if collab exists
        var collab = await _context.Collabs.FindAsync(collabId);
        if (collab == null)
        {
            _logger.LogWarning($"Collaboration {collabId} not found");
            return NotFound("Collaboration not found");
        }

        // Create submission record
        var submission = new Submission
        {
            CollabId = collabId,
            AudioFilePath = "/uploads/test.mp3", // Temporary test path
            CreatedAt = DateTime.UtcNow,
            VolumeOffset = volumeOffset,
            Id = 0,
            Collab = null
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Successfully created submission {submission.Id} for collab {collabId}");
        return CreatedAtAction(nameof(GetSubmissionsForCollab), new { collabId = collabId }, submission);
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