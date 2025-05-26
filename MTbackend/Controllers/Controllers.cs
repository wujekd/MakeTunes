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