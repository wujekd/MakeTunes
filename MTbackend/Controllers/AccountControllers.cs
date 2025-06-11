using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MTbackend.Models;
using MTbackend.Models.DTOs;

namespace MTbackend.Controllers;


[Route("[controller]")]
[ApiController]
public class AccountControllers : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;

    public AccountControllers(AppDbContext context, UserManager<User> userManager, IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _configuration = configuration;
    }
    
    // registrt a new user
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
        
        
        // Extract error messages from result.Errors
        var errors = result.Errors.Select(e => e.Description);

        return BadRequest(new 
        { 
            message = "Registration failed.", 
            errors
        });
    
    }
    
    // Authenticates a user and returns a JWT token
    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(LoginDto request)
    {
        var user = await _userManager.FindByNameAsync(request.Name);
        if (user == null)
        {
            return Unauthorized(new { message = "User not found" });
        }

        var passwordCheck = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordCheck)
        {
            return Unauthorized(new { message = "Invalid password" });
        }
        

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
        var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: signIn);

        return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token)});
    }
}