using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class VotingControllers : ControllerBase
{
    private readonly AppDbContext _context;

    public VotingControllers(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Adds a submission to favorites
    /// </summary>
    /// <param name="dto">The favorite creation data</param>
    /// <returns>The created favorite</returns>
    [HttpPost]
    [ProducesResponseType(typeof(FavoriteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FavoriteResponseDto>> AddFavorite([FromBody] CreateFavoriteDto dto)
    {
        // Check if submission exists
        var submission = await _context.Submissions.FindAsync(dto.SubmissionId);
        if (submission == null)
        {
            return NotFound("Submission not found");
        }

        // Check if collab exists
        var collab = await _context.Collabs.FindAsync(dto.CollabId);
        if (collab == null)
        {
            return NotFound("Collab not found");
        }

        // Check if favorite already exists
        var existingFavorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.SubmissionId == dto.SubmissionId && f.CollabId == dto.CollabId);
        
        if (existingFavorite != null)
        {
            return BadRequest("This submission is already in favorites");
        }

        var favorite = new Favorite
        {
            SubmissionId = dto.SubmissionId,
            CollabId = dto.CollabId,
            IsFinalChoice = false
        };

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();

        return Ok(new FavoriteResponseDto
        {
            Id = favorite.Id,
            SubmissionId = favorite.SubmissionId,
            CollabId = favorite.CollabId,
            IsFinalChoice = favorite.IsFinalChoice,
            CreatedAt = favorite.CreatedAt
        });
    }

    /// <summary>
    /// Marks a favorite as the final choice
    /// </summary>
    /// <returns>The updated favorite</returns>
    [HttpPut("{submissionId}/final-choice")]
    [ProducesResponseType(typeof(FavoriteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FavoriteResponseDto>> MarkAsFinalChoice(int submissionId)
    {
        var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.SubmissionId == submissionId);
        if (favorite == null)
        {
            return NotFound("Favorite not found");
        }

        // Unmark any existing final choice for this collab
        var existingFinalChoice = await _context.Favorites
            .FirstOrDefaultAsync(f => f.CollabId == favorite.CollabId && f.IsFinalChoice);
        if (existingFinalChoice != null)
        {
            existingFinalChoice.IsFinalChoice = false;
        }
        
        favorite.IsFinalChoice = true;
        await _context.SaveChangesAsync();

        return Ok(new FavoriteResponseDto
        {
            Id = favorite.Id,
            SubmissionId = favorite.SubmissionId,
            CollabId = favorite.CollabId,
            IsFinalChoice = favorite.IsFinalChoice,
            CreatedAt = favorite.CreatedAt
        });
    }

    /// <summary>
    /// Gets all favorites for a collaboration
    /// </summary>
    /// <param name="collabId">The collaboration ID</param>
    /// <returns>List of favorites</returns>
    [HttpGet("collab/{collabId}")]
    [ProducesResponseType(typeof(IEnumerable<FavoriteResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<FavoriteResponseDto>>> GetFavoritesByCollab(int collabId)
    {
        var favorites = await _context.Favorites
            .Where(f => f.CollabId == collabId)
            .Select(f => new FavoriteResponseDto
            {
                Id = f.Id,
                SubmissionId = f.SubmissionId,
                CollabId = f.CollabId,
                IsFinalChoice = f.IsFinalChoice,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(favorites);
    }

    /// <summary>
    /// Marks a submission as listened
    /// </summary>
    /// <param name="submissionId">The submission ID</param>
    /// <returns>The created listened record</returns>
    [HttpPost("submissions/{submissionId}/mark-listened")]
    [ProducesResponseType(typeof(Listened), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsListened(int submissionId)
    {
        // Check if submission exists and get its project
        var submission = await _context.Submissions
            .Include(s => s.Collab)
            .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
        {
            return NotFound("Submission not found");
        }

        // Check if already marked as listened
        var existingListened = await _context.ListenedMarkings
            .FirstOrDefaultAsync(l => l.Submission.Id == submissionId);
        
        if (existingListened != null)
        {
            return Ok("Already marked as listened");
        }

        var listened = new Listened
        {
            Submission = submission,
            Project = submission.Collab.Project
        };

        _context.ListenedMarkings.Add(listened);
        await _context.SaveChangesAsync();

        return Ok(listened);
    }
}