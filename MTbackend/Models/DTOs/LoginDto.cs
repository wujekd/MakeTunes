namespace MTbackend.Models.DTOs;


// Data transfer object for user login credentials
public class LoginDto
{
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}