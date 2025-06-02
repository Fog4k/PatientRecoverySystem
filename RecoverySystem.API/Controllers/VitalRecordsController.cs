using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;
using RecoverySystem.API.Services;

namespace RecoverySystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VitalRecordsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TelegramNotifier _notifier;

    public VitalRecordsController(AppDbContext context, TelegramNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VitalRecord>>> GetAll()
    {
        var vitals = await _context.VitalRecords
            .Include(v => v.Patient)
            .OrderByDescending(v => v.Timestamp)
            .ToListAsync();

        return Ok(vitals);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VitalRecord>> GetById(int id)
    {
        var record = await _context.VitalRecords
            .Include(v => v.Patient)
            .FirstOrDefaultAsync(v => v.Id == id);

        return record == null ? NotFound() : Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<VitalRecord>> Create(VitalRecord record)
    {
        record.Timestamp = DateTime.UtcNow;

        // Собираем тревожные показатели
        var alerts = new List<string>();

        if (record.Temperature >= 39)
            alerts.Add($"высокая температура: {record.Temperature}°C");

        if (record.Pulse > 120 || record.Pulse < 50)
            alerts.Add($"ненормальный пульс: {record.Pulse} уд/мин");

        if (record.BloodPressureSystolic > 180 || record.BloodPressureDiastolic > 110)
            alerts.Add($"высокое давление: {record.BloodPressureSystolic}/{record.BloodPressureDiastolic} мм рт.ст.");

        // Уведомления только если есть отклонения
        if (alerts.Any())
        {
            var usersToNotify = await _context.Users
                .Include(u => u.UserRoles)
                .Where(u => u.TelegramChatId != null &&
                            u.UserRoles.Any(r => r.Role.Name == "Doctor" || r.Role.Name == "Nurse"))
                .ToListAsync();

            string message = $"⚠️ У пациента ID {record.PatientId} обнаружены тревожные показатели:\n• " +
                             string.Join("\n• ", alerts);

            foreach (var user in usersToNotify)
            {
                await _notifier.SendMessageAsync(user.TelegramChatId!, message);
            }
        }

        _context.VitalRecords.Add(record);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, VitalRecord record)
    {
        if (id != record.Id)
            return BadRequest();

        var exists = await _context.VitalRecords.AnyAsync(r => r.Id == id);
        if (!exists) return NotFound();

        _context.Entry(record).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var record = await _context.VitalRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.VitalRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}