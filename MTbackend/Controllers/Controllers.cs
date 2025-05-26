using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]          // => /api/projects
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;

    public ProjectsController(AppDbContext dbContext, IWebHostEnvironment environment)
    {
        _dbContext = dbContext;
        _environment = environment;
    }


    [HttpGet]                        // GET /api/projects
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _dbContext.Projects.ToListAsync();
        return Ok(projects);
    }


    [HttpPost]
    public async Task<IActionResult> AddProject([FromForm] ProjectDto projectDto)
    {
        string? audioFilePath = null;
        
        if (projectDto.AudioFile != null)
        {
            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "audio/collabs");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}_{projectDto.AudioFile.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await projectDto.AudioFile.CopyToAsync(stream);
            }

            // Store relative path in database
            audioFilePath = $"/uploads/{uniqueFileName}";
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = projectDto.Name,
            Description = projectDto.Description,
            AudioFilePath = audioFilePath
        };

        _dbContext.Projects.Add(project);
        await _dbContext.SaveChangesAsync();
        
        return Ok(project);
    }

}