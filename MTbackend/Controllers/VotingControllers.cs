using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
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
    private readonly UserManager<User> _userManager;

    public VotingControllers(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Adds a submission to favorites
    /// </summary>
    /// <param name="dto">The favorite creation data</param>
    /// <returns>The created favorite</returns>
    [HttpPost("add-favorite")]
    [ProducesResponseType(typeof(FavoriteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FavoriteResponseDto>> AddFavorite([FromBody] CreateFavoriteDto dto)
    {
        var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User not found");
        }
        
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
            IsFinalChoice = false,
            UserId = userId,
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
    /// Removes a submission from favorites
    /// </summary>
    /// <param name="dto">The favorite removal data</param>
    /// <returns>No content or error</returns>
    [HttpDelete("remove-favorite")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveFavorite([FromBody] CreateFavoriteDto dto)
    {
        if (dto.SubmissionId <= 0 || dto.CollabId <= 0)
        {
            return BadRequest("Invalid submission or collab ID.");
        }
        
        var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User not found");
        }

        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.SubmissionId == dto.SubmissionId && f.CollabId == dto.CollabId);

        if (favorite == null)
        {
            return NotFound("No such thing");
        }

        if (favorite.UserId != userId)
        {
            return Unauthorized("U cant do that mate");
        }

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();

        return Ok(); // 204 response
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
        
        var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User not found");
        }
        
        var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.SubmissionId == submissionId);
        if (favorite == null)
        {
            return NotFound("Favorite not found");
        }
        
        if (favorite.UserId != userId)
        {
            return Unauthorized();
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
        
        var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User not found");
        }
        
        
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
            Project = submission.Collab.Project,
            UserId = userId
            
        };

        _context.ListenedMarkings.Add(listened);
        await _context.SaveChangesAsync();

        return Ok(listened);
    }
}