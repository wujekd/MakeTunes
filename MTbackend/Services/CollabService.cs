using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend.Services;

public class CollabService
{
    private readonly AppDbContext _context;

    public CollabService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Collab> CreateCollab(string name, string description, string projectId, string? audioFilePath = null)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
        {
            throw new ArgumentException($"Project with ID {projectId} not found");
        }

        var collab = new Collab
        {
            Id = await GetNextCollabId(),
            Name = name,
            Description = description,
            ProjectId = projectId,
            Project = project,
            AudioFilePath = audioFilePath
        };

        _context.Collabs.Add(collab);
        await _context.SaveChangesAsync();
        
        return collab;
    }

    private async Task<int> GetNextCollabId()
    {
        var lastCollab = await _context.Collabs.OrderByDescending(c => c.Id).FirstOrDefaultAsync();
        return (lastCollab?.Id ?? 0) + 1;
    }

    public async Task<Collab> CreateInitialCollab(string projectId)
    {
        return await CreateCollab(
            name: "Initial Collab",
            description: "First collab for this project",
            projectId: projectId
        );
    }
} 