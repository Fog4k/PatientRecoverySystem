using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TelegramController : ControllerBase
{
    private readonly AppDbContext _context;

    public TelegramController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpPost("bind")]
    public async Task<IActionResult> BindChatId([FromBody] TelegramBindDto dto)
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrEmpty(username))
            return Unauthorized("Invalid token");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return Unauthorized("User not found");

        user.TelegramChatId = dto.ChatId;
        await _context.SaveChangesAsync();

        return Ok("Telegram успешно привязан");
    }
}

public class TelegramBindDto
{
    public string ChatId { get; set; } = string.Empty;
}