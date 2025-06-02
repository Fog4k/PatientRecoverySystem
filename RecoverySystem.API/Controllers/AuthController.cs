using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.DTO;
using RecoverySystem.Domain.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(string username, string password, string role)
    {
        var exists = await _context.Users.AnyAsync(u => u.Username == username);
        if (exists)
            return BadRequest("User already exists");

        if (role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            bool adminExists = await _context.UserRoles
                .Include(ur => ur.Role)
                .AnyAsync(ur => ur.Role!.Name == "Admin");

            if (adminExists)
                return Forbid("Admin role can only be assigned manually by an existing admin.");
        }

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Name == role);
        if (roleEntity == null)
        {
            roleEntity = new Role { Name = role };
            _context.Roles.Add(roleEntity);
            await _context.SaveChangesAsync();
        }

        user.UserRoles.Add(new UserRole
        {
            User = user,
            Role = roleEntity!
        });

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("User registered");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);
        return Ok(new { token });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        foreach (var role in user.UserRoles)
        {
            if (!string.IsNullOrEmpty(role.Role?.Name))
                claims.Add(new Claim(ClaimTypes.Role, role.Role.Name));
        }

        var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // ✅ Новый эндпоинт проверки привязки Telegram
    [HttpGet("check-telegram")]
    [Authorize]
    public async Task<IActionResult> CheckTelegram()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null || !int.TryParse(userId, out int id))
            return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return Unauthorized();

        return Ok(new { linked = user.TelegramChatId != null });
    }
}