namespace RecoverySystem.Domain.Models;

public class RehabilitationLog
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Activities { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public DateTime DateLogged { get; set; }

    public Patient? Patient { get; set; }
}