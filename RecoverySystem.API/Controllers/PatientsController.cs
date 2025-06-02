using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.API.Services;
using RecoverySystem.Domain.Models;
using System.Security.Claims;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Doctor,Nurse,Admin")]
public class PatientsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuditLogger _audit;

    public PatientsController(AppDbContext context, AuditLogger audit)
    {
        _context = context;
        _audit = audit;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Patient>>> GetAll(
    [FromQuery] string? search,
    [FromQuery] int? doctorId)
    {
        var query = _context.Patients
            .Include(p => p.Doctor)
            .AsQueryable();

        var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        int.TryParse(userIdClaim?.Value, out int userId);

        if (userRole == "Doctor")
        {
            query = query.Where(p => p.DoctorId == userId);
        }
        else if (doctorId.HasValue)
        {
            query = query.Where(p => p.DoctorId == doctorId);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.FullName.Contains(search));
        }

        var result = await query.ToListAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Patient>> GetById(int id)
    {
        var patient = await _context.Patients
            .Include(p => p.Doctor)
            .FirstOrDefaultAsync(p => p.Id == id);

        return patient == null ? NotFound() : Ok(patient);
    }

    [HttpPost]
    public async Task<ActionResult<Patient>> Create(Patient patient)
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        var username = User.Identity?.Name ?? "Unknown";

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int doctorId))
        {
            patient.DoctorId = doctorId;
        }

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        await _audit.LogAsync(username, $"Создал пациента: {patient.FullName}");

        return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Patient patient)
    {
        if (id != patient.Id)
            return BadRequest();

        var exists = await _context.Patients.AnyAsync(p => p.Id == id);
        if (!exists) return NotFound();

        _context.Entry(patient).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        await _audit.LogAsync(User.Identity?.Name ?? "Unknown", $"Обновил пациента ID: {id}");

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound();

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();

        await _audit.LogAsync(User.Identity?.Name ?? "Unknown", $"Удалил пациента ID: {id}");

        return NoContent();
    }

    [HttpPatch("{id}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignDoctor(int id, [FromQuery] int doctorId)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient == null) return NotFound("Пациент не найден");

        var doctorExists = await _context.Users
            .Include(u => u.UserRoles)
            .AnyAsync(u => u.Id == doctorId && u.UserRoles.Any(r => r.Role.Name == "Doctor"));

        if (!doctorExists)
            return BadRequest("Доктор не найден или не имеет нужной роли");

        patient.DoctorId = doctorId;
        await _context.SaveChangesAsync();

        await _audit.LogAsync(User.Identity?.Name ?? "Unknown", $"Назначил доктору ID {doctorId} пациента ID {id}");

        return Ok("Доктор назначен пациенту");
    }
}