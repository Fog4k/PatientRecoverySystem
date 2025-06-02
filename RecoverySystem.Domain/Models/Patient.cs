namespace RecoverySystem.Domain.Models;

public class Patient
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public string? PhotoUrl { get; set; }

    // 👇 Связь с доктором
    public int? DoctorId { get; set; }
    public User? Doctor { get; set; }
}