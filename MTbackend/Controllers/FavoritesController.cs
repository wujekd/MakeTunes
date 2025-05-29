using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context)
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
    /// <param name="id">The favorite ID</param>
    /// <returns>The updated favorite</returns>
    [HttpPut("{id}/final-choice")]
    [ProducesResponseType(typeof(FavoriteResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FavoriteResponseDto>> MarkAsFinalChoice(int id)
    {
        var favorite = await _context.Favorites.FindAsync(id);
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
}