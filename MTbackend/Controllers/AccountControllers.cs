using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MTbackend.Models;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;


[Route("[controller]")]
[ApiController]
public class AccountControllers : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;

    public AccountControllers(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    
    
    [HttpPost]
    [Route("/register")]
    public async Task<IActionResult> Registration(LoginDto user)
    {
        var exsistingUser = await _userManager.FindByNameAsync(user.Name);
        if (exsistingUser != null)
        {
            return BadRequest(new { message = "Username already exists!" });
        }

        var newUser = new User
        {
            UserName = user.Name
        };

        var result = await _userManager.CreateAsync(newUser, user.Password);

        if (result.Succeeded)
        {
            return Ok(new { message = "Registration success!" });
        }
        else
        {
            // Extract error messages from result.Errors
            var errors = result.Errors.Select(e => e.Description);

            return BadRequest(new 
            { 
                message = "Registration failed.", 
                errors
            });
        }
    }
}
