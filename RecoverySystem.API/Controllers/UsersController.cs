using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;

namespace RecoverySystem.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // Получить всех пользователей с их ролями
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .Select(u => new
            {
                u.Id,
                u.Username,
                Roles = u.UserRoles.Select(ur => ur.Role!.Name)
            })
            .ToListAsync();

        return Ok(users);
    }

    // Назначить роль пользователю
    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(string username, string role)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return NotFound("User not found");

        var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Name == role);
        if (roleEntity == null)
        {
            roleEntity = new Role { Name = role };
            _context.Roles.Add(roleEntity);
            await _context.SaveChangesAsync();
        }

        var alreadyHas = user.UserRoles.Any(ur => ur.RoleId == roleEntity.Id);
        if (alreadyHas)
            return BadRequest("User already has this role");

        user.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = roleEntity.Id
        });

        await _context.SaveChangesAsync();
        return Ok($"Role '{role}' assigned to {username}");
    }

    // Удалить роль у пользователя
    [HttpDelete("remove-role")]
    public async Task<IActionResult> RemoveRole(string username, string role)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            return NotFound("User not found");

        var target = user.UserRoles.FirstOrDefault(ur => ur.Role!.Name == role);
        if (target == null)
            return BadRequest("User does not have this role");

        _context.UserRoles.Remove(target);
        await _context.SaveChangesAsync();

        return Ok($"Role '{role}' removed from {username}");
    }

    
}