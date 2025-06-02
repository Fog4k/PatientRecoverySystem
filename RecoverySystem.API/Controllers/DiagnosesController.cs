using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;

namespace RecoverySystem.API.Controllers;

[Authorize(Roles = "Doctor")]
[ApiController]
[Route("api/[controller]")]
public class DiagnosesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DiagnosesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [AllowAnonymous] // 👈 можно убрать, если хочешь ограничить всем
    public async Task<ActionResult<IEnumerable<Diagnosis>>> GetAll()
    {
        return Ok(await _context.Diagnoses.Include(d => d.Patient).ToListAsync());
    }

    [HttpGet("{id}")]
    [AllowAnonymous] // 👈 можно убрать
    public async Task<ActionResult<Diagnosis>> GetById(int id)
    {
        var diagnosis = await _context.Diagnoses.Include(d => d.Patient)
                                                 .FirstOrDefaultAsync(d => d.Id == id);

        return diagnosis == null ? NotFound() : Ok(diagnosis);
    }

    [HttpPost]
    public async Task<ActionResult<Diagnosis>> Create(Diagnosis diagnosis)
    {
        diagnosis.DateRecorded = DateTime.UtcNow;

        _context.Diagnoses.Add(diagnosis);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = diagnosis.Id }, diagnosis);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Diagnosis diagnosis)
    {
        if (id != diagnosis.Id)
            return BadRequest();

        var exists = await _context.Diagnoses.AnyAsync(d => d.Id == id);
        if (!exists) return NotFound();

        _context.Entry(diagnosis).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var diagnosis = await _context.Diagnoses.FindAsync(id);
        if (diagnosis == null) return NotFound();

        _context.Diagnoses.Remove(diagnosis);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}