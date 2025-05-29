using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTbackend.Models;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<FavoriteResponseDto>> AddFavorite(CreateFavoriteDto dto)
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

    [HttpPut("{id}/final-choice")]
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
}