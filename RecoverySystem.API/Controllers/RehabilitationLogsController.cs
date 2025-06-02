using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RehabilitationLogsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RehabilitationLogsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RehabilitationLog>>> GetAll()
    {
        var logs = await _context.RehabilitationLogs
            .Include(r => r.Patient)
            .OrderByDescending(r => r.DateLogged)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RehabilitationLog>> GetById(int id)
    {
        var log = await _context.RehabilitationLogs
            .Include(r => r.Patient)
            .FirstOrDefaultAsync(r => r.Id == id);

        return log == null ? NotFound() : Ok(log);
    }

    [HttpPost]
    public async Task<ActionResult<RehabilitationLog>> Create(RehabilitationLog log)
    {
        log.DateLogged = DateTime.UtcNow;

        _context.RehabilitationLogs.Add(log);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = log.Id }, log);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, RehabilitationLog log)
    {
        if (id != log.Id)
            return BadRequest();

        var exists = await _context.RehabilitationLogs.AnyAsync(r => r.Id == id);
        if (!exists) return NotFound();

        _context.Entry(log).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _context.RehabilitationLogs.FindAsync(id);
        if (log == null) return NotFound();

        _context.RehabilitationLogs.Remove(log);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}