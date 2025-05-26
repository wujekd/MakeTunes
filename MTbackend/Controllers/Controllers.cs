using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]          // => /api/projects
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ProjectsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]                        // GET /api/projects
    public async Task<IActionResult> GetProjects()
    {
        var projects = await _dbContext.Projects.ToListAsync();
        return Ok(projects);
    }


    [HttpPost]
    public async Task<IActionResult> AddProject(Project project)
    {
        _dbContext.Projects.Add(project);
        return Ok();
    }
    
}