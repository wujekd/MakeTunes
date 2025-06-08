using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/dev")]
public class DevController : ControllerBase
{
    private readonly AppDbContext _context;

    public DevController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("collabs/{collabId}/stage")]
    public async Task<ActionResult<Collab>> SwitchCollabStage(int collabId, [FromBody] StageSwitchRequest request)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        switch (request.Stage.ToLower())
        {
            case "voting":
                collab.Stage = CollabStage.Voting;
                collab.Project.IsInVotingStage = true;
                break;
            case "submission":
                collab.Stage = CollabStage.Submission;
                collab.Project.IsInVotingStage = false;
                break;
            default:
                return BadRequest("Invalid stage. Must be either 'voting' or 'submission'");
        }

        await _context.SaveChangesAsync();
        return Ok(collab);
    }

    [HttpGet("delete-all-submissions")]
    public async Task<IActionResult> DeleteAllSubmissions()
    {
        _context.Submissions.RemoveRange(_context.Submissions);
        await _context.SaveChangesAsync();
        return Ok("All submissions deleted");
    }
}



public class StageSwitchRequest
{
    public required string Stage { get; set; }
} 