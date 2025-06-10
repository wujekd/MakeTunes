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

    // Testing endpoints for collab timing system
    
    [HttpPost("collabs/{collabId}/trigger-submission-end")]
    public async Task<ActionResult<object>> TriggerSubmissionPhaseEnd(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Submissions)
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Stage != CollabStage.Submission)
        {
            return BadRequest("Collab is not in submission stage");
        }

        var submissionCount = collab.Submissions.Count;
        
        if (submissionCount == 0)
        {
            // No submissions - complete the collab
            collab.Stage = CollabStage.Completed;
            collab.Completed = true;
            collab.CompletionReason = "NoSubmissions";
            collab.Project.IsInVotingStage = false;
        }
        else
        {
            // Move to voting stage
            collab.Stage = CollabStage.Voting;
            collab.Project.IsInVotingStage = true;
        }

        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            CollabId = collab.Id,
            NewStage = collab.Stage.ToString(),
            SubmissionCount = submissionCount,
            CompletionReason = collab.CompletionReason,
            Message = submissionCount == 0 
                ? "Collab completed - no submissions received"
                : $"Moved to voting stage with {submissionCount} submissions"
        });
    }

    [HttpPost("collabs/{collabId}/trigger-voting-end")]
    public async Task<ActionResult<object>> TriggerVotingPhaseEnd(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Submissions)
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        if (collab.Stage != CollabStage.Voting)
        {
            return BadRequest("Collab is not in voting stage");
        }

        // Calculate results using the same logic as the background service
        var result = await CalculateVotingResults(collabId);
        
        collab.Stage = CollabStage.Completed;
        collab.Completed = true;
        collab.CompletionReason = "VotingComplete";
        collab.WinningSubmissionId = result.WinningSubmissionId;
        collab.Project.IsInVotingStage = false;

        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            CollabId = collab.Id,
            NewStage = collab.Stage.ToString(),
            CompletionReason = collab.CompletionReason,
            WinningSubmissionId = collab.WinningSubmissionId,
            VoteResults = result.VoteResults,
            Message = result.WinningSubmissionId.HasValue 
                ? $"Voting completed. Winner: Submission {result.WinningSubmissionId}"
                : "Voting completed. No votes received."
        });
    }

    [HttpGet("collabs/{collabId}/vote-count")]
    public async Task<ActionResult<object>> GetVoteCount(int collabId)
    {
        var result = await CalculateVotingResults(collabId);
        
        return Ok(new
        {
            CollabId = collabId,
            VoteResults = result.VoteResults,
            WinningSubmissionId = result.WinningSubmissionId,
            TotalVotes = result.VoteResults.Sum(v => v.VoteCount)
        });
    }

    [HttpPost("collabs/{collabId}/force-complete")]
    public async Task<ActionResult<object>> ForceCompleteCollab(int collabId, [FromBody] ForceCompleteRequest request)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        collab.Stage = CollabStage.Completed;
        collab.Completed = true;
        collab.CompletionReason = request.Reason ?? "ForceCompleted";
        collab.WinningSubmissionId = request.WinningSubmissionId;
        collab.Project.IsInVotingStage = false;

        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            CollabId = collab.Id,
            NewStage = collab.Stage.ToString(),
            CompletionReason = collab.CompletionReason,
            WinningSubmissionId = collab.WinningSubmissionId,
            Message = "Collab force completed"
        });
    }

    [HttpPost("collabs/{collabId}/reset-to-submission")]
    public async Task<ActionResult<object>> ResetToSubmission(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        collab.Stage = CollabStage.Submission;
        collab.Completed = false;
        collab.CompletionReason = null;
        collab.WinningSubmissionId = null;
        collab.Project.IsInVotingStage = false;

        await _context.SaveChangesAsync();
        
        return Ok(new
        {
            CollabId = collab.Id,
            NewStage = collab.Stage.ToString(),
            Message = "Collab reset to submission stage"
        });
    }

    [HttpPost("collabs/{collabId}/debug-release")]
    public async Task<ActionResult<object>> DebugReleaseCollab(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == collabId);

        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        var beforeState = new
        {
            Released = collab.Released,
            ReleaseTime = collab.ReleaseTime,
            CurrentUtc = DateTime.UtcNow
        };

        if (collab.Released)
        {
            return BadRequest(new { 
                message = "Collab is already released", 
                beforeState = beforeState 
            });
        }

        // Apply the release logic
        collab.Released = true;
        collab.ReleaseTime = DateTime.UtcNow;
        
        if (collab.Stage == CollabStage.Voting)
        {
            collab.Project.IsInVotingStage = true;
        }

        await _context.SaveChangesAsync();

        // Reload from database to verify it was saved
        await _context.Entry(collab).ReloadAsync();

        var afterState = new
        {
            Released = collab.Released,
            ReleaseTime = collab.ReleaseTime,
            CurrentUtc = DateTime.UtcNow
        };

        return Ok(new { 
            message = "Collab released successfully", 
            beforeState = beforeState,
            afterState = afterState
        });
    }

    [HttpGet("collabs/{collabId}/timing-info")]
    public async Task<ActionResult<object>> GetTimingInfo(int collabId)
    {
        var collab = await _context.Collabs
            .Include(c => c.Submissions)
            .FirstOrDefaultAsync(c => c.Id == collabId);
            
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        var now = DateTime.UtcNow;
        
        return Ok(new
        {
            CollabId = collab.Id,
            CurrentStage = collab.Stage.ToString(),
            Released = collab.Released,
            ReleaseTime = collab.ReleaseTime,
            SubmissionDuration = collab.SubmissionDuration,
            VotingDuration = collab.VotingDuration,
            SubmissionEndTime = collab.SubmissionEndTime,
            VotingEndTime = collab.VotingEndTime,
            SubmissionCount = collab.Submissions.Count,
            Completed = collab.Completed,
            CompletionReason = collab.CompletionReason,
            WinningSubmissionId = collab.WinningSubmissionId,
            TimeRemaining = collab.Stage switch
            {
                CollabStage.Submission => collab.SubmissionEndTime?.Subtract(now),
                CollabStage.Voting => collab.VotingEndTime?.Subtract(now),
                _ => null
            }
        });
    }

    private async Task<VotingResult> CalculateVotingResults(int collabId)
    {
        var submissionVotes = await _context.Submissions
            .Where(s => s.CollabId == collabId)
            .Select(s => new VoteResult
            {
                SubmissionId = s.Id,
                VoteCount = _context.Favorites
                    .Where(f => f.SubmissionId == s.Id && f.IsFinalChoice == true)
                    .Count(),
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        int? winningSubmissionId = null;
        
        if (submissionVotes.Any())
        {
            var winner = submissionVotes
                .OrderByDescending(sv => sv.VoteCount)
                .ThenBy(sv => sv.CreatedAt) // Tie breaker: earliest submission wins
                .First();

            if (winner.VoteCount > 0)
            {
                winningSubmissionId = winner.SubmissionId;
            }
        }

        return new VotingResult
        {
            VoteResults = submissionVotes,
            WinningSubmissionId = winningSubmissionId
        };
    }
}



public class StageSwitchRequest
{
    public required string Stage { get; set; }
}

public class ForceCompleteRequest
{
    public string? Reason { get; set; }
    public int? WinningSubmissionId { get; set; }
}

public class VoteResult
{
    public int SubmissionId { get; set; }
    public int VoteCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VotingResult
{
    public List<VoteResult> VoteResults { get; set; } = new();
    public int? WinningSubmissionId { get; set; }
} 