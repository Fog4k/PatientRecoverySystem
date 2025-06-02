using RecoverySystem.API.Data;
using RecoverySystem.Domain.Models;

namespace RecoverySystem.API.Services;

public class AuditLogger
{
    private readonly AppDbContext _context;

    public AuditLogger(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string username, string action)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            Username = username,
            Action = action,
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }
}